import { and, count, eq, type SQL } from "drizzle-orm";
import { Effect, Layer } from "effect";
import { match, P } from "ts-pattern";
import { PAYROLL_SORT, type TPayrollSort } from "@app/schemas";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { calculatePayroll } from "#/payroll/domain/payroll-calculator.ts";
import {
	PayrollRepo,
	type TEmployeeTaxYtdRow,
	type TPayrollItemRow,
	type TPayrollPeriodRow,
	type TPayrollRepo,
} from "#/payroll/domain/payroll.ts";
import { DbService, dbServiceLayer } from "#/platform/db/db-service.ts";
import { containsWhere } from "#/platform/db/search.ts";
import { employee } from "#/platform/db/tables/employee.ts";
import {
	employeeTaxYtd,
	payrollItem,
	payrollPeriod,
} from "#/platform/db/tables/payroll.ts";
import { dbActive } from "#/platform/db/transaction.ts";
import { EDatabase } from "#/shared/errors.ts";
import { offsetFor, orderFor } from "#/shared/pagination.ts";

const SORT_COLUMN: Record<TPayrollSort, AnyPgColumn> = {
	[PAYROLL_SORT.NAME]: payrollPeriod.name,
	[PAYROLL_SORT.YEAR]: payrollPeriod.year,
	[PAYROLL_SORT.MONTH]: payrollPeriod.month,
	[PAYROLL_SORT.STATUS]: payrollPeriod.status,
	[PAYROLL_SORT.PAY_DATE]: payrollPeriod.payDate,
	[PAYROLL_SORT.CREATED_AT]: payrollPeriod.createdAt,
};

const statusWhere = (status: string | undefined): SQL | undefined =>
	match(status)
		.with(P.nonNullable, (value) => eq(payrollPeriod.status, value))
		.otherwise(() => undefined);

const yearWhere = (year: number | undefined): SQL | undefined =>
	match(year)
		.with(P.nonNullable, (value) => eq(payrollPeriod.year, value))
		.otherwise(() => undefined);

export const payrollRepoLayer = Layer.effect(
	PayrollRepo,
	Effect.gen(function* () {
		const { db } = yield* DbService;

		const createPeriod: TPayrollRepo["createPeriod"] = (input) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.insert(payrollPeriod)
						.values({
							...input,
							status: "draft",
							totalEmployees: 0,
							totalGross: 0,
							totalPph21: 0,
							totalNetPay: 0,
						})
						.returning();
					return row as TPayrollPeriodRow;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const findPeriodById: TPayrollRepo["findPeriodById"] = (id) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.select()
						.from(payrollPeriod)
						.where(eq(payrollPeriod.id, id))
						.limit(1);
					return (row as TPayrollPeriodRow) ?? null;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const listPeriods: TPayrollRepo["listPeriods"] = ({
			page,
			pageSize,
			year,
			status,
			sortBy,
			sortDir,
		}) => {
			const where = and(yearWhere(year), statusWhere(status));

			return Effect.tryPromise({
				try: async () => {
					const [items, [{ value: total }]] = await Promise.all([
						dbActive(db)
							.select()
							.from(payrollPeriod)
							.where(where)
							.limit(pageSize)
							.offset(offsetFor({ page, pageSize }))
							.orderBy(orderFor(SORT_COLUMN[sortBy], sortDir)),
						dbActive(db)
							.select({ value: count() })
							.from(payrollPeriod)
							.where(where),
					]);
					return { items: items as TPayrollPeriodRow[], total };
				},
				catch: (cause) => new EDatabase({ cause }),
			});
		};

		const updatePeriod: TPayrollRepo["updatePeriod"] = ({ id, ...patch }) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.update(payrollPeriod)
						.set({ ...patch, updatedAt: new Date() })
						.where(eq(payrollPeriod.id, id))
						.returning();
					return (row as TPayrollPeriodRow) ?? null;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const findTaxYtd: TPayrollRepo["findTaxYtd"] = (employeeId, taxYear) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.select()
						.from(employeeTaxYtd)
						.where(
							and(
								eq(employeeTaxYtd.employeeId, employeeId),
								eq(employeeTaxYtd.taxYear, taxYear),
							),
						)
						.limit(1);
					return (row as TEmployeeTaxYtdRow) ?? null;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const calculatePeriod: TPayrollRepo["calculatePeriod"] = ({
			periodId,
			employeeIds,
		}) =>
			Effect.tryPromise({
				try: async () => {
					const [periodRow] = await dbActive(db)
						.select()
						.from(payrollPeriod)
						.where(eq(payrollPeriod.id, periodId))
						.limit(1);

					if (!periodRow) {
						throw new Error("Period not found");
					}

					// Ambil daftar karyawan yang relevan
					const employees = await dbActive(db)
						.select()
						.from(employee)
						.where(
							employeeIds && employeeIds.length > 0
								? and(eq(employee.employmentStatus, "permanent")) // disederhanakan
								: undefined,
						);

					// Hapus item kalkulasi periode lama bila sudah ada
					await dbActive(db)
						.delete(payrollItem)
						.where(eq(payrollItem.payrollPeriodId, periodId));

					let totalGross = 0;
					let totalPph21 = 0;
					let totalNetPay = 0;
					let processed = 0;

					for (const emp of employees) {
						let ytdContext:
							| {
									ytdGrossJanToNov: number;
									ytdPph21JanToNov: number;
									ytdJhtEmployeeJanToNov?: number;
									ytdJpEmployeeJanToNov?: number;
							  }
							| undefined;

						if (periodRow.month === 12) {
							const [ytd] = await dbActive(db)
								.select()
								.from(employeeTaxYtd)
								.where(
									and(
										eq(employeeTaxYtd.employeeId, emp.id),
										eq(employeeTaxYtd.taxYear, periodRow.year),
									),
								)
								.limit(1);

							if (ytd) {
								ytdContext = {
									ytdGrossJanToNov: ytd.totalGross,
									ytdPph21JanToNov: ytd.totalPph21Paid,
									ytdJhtEmployeeJanToNov: ytd.totalJhtEmployee,
									ytdJpEmployeeJanToNov: ytd.totalJpEmployee,
								};
							}
						}

						const calc = calculatePayroll({
							basicSalary: emp.basicSalary,
							ptkpCode: emp.ptkpCode as any,
							taxMethod: emp.taxMethod as any,
							jkkRiskGrade: emp.jkkRiskGrade,
							month: periodRow.month,
							ytdContext,
						});

						await dbActive(db).insert(payrollItem).values({
							payrollPeriodId: periodId,
							employeeId: emp.id,
							employeeCode: emp.employeeCode,
							employeeName: emp.fullName,
							department: emp.department,
							position: emp.position,
							basicSalary: calc.basicSalary,
							allowanceTotal: calc.allowances,
							overtimeHours: 0,
							overtimePay: calc.overtimePay,
							bonusTotal: calc.bonus,
							naturaTotal: calc.natura,
							taxAllowance: calc.taxAllowance,
							grossTotal: calc.cashGross,
							bpjsBreakdown: calc.bpjs,
							taxBreakdown: calc.tax,
							deductionTotal: calc.totalEmployeeDeductions,
							netPay: calc.netPay,
							calculationLog: calc.explanation,
						});

						totalGross += calc.cashGross;
						totalPph21 += calc.tax.pph21Monthly;
						totalNetPay += calc.netPay;
						processed += 1;
					}

					// Update rangkuman periode
					const [updatedPeriod] = await dbActive(db)
						.update(payrollPeriod)
						.set({
							totalEmployees: processed,
							totalGross,
							totalPph21,
							totalNetPay,
							status: "calculating",
							updatedAt: new Date(),
						})
						.where(eq(payrollPeriod.id, periodId))
						.returning();

					return {
						period: updatedPeriod as TPayrollPeriodRow,
						processed,
					};
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const listItems: TPayrollRepo["listItems"] = ({
			page,
			pageSize,
			periodId,
			department: dept,
			search,
		}) => {
			const where = and(
				eq(payrollItem.payrollPeriodId, periodId),
				dept ? eq(payrollItem.department, dept) : undefined,
				search
					? containsWhere(payrollItem.employeeName, search)
					: undefined,
			);

			return Effect.tryPromise({
				try: async () => {
					const [items, [{ value: total }]] = await Promise.all([
						dbActive(db)
							.select()
							.from(payrollItem)
							.where(where)
							.limit(pageSize)
							.offset(offsetFor({ page, pageSize })),
						dbActive(db)
							.select({ value: count() })
							.from(payrollItem)
							.where(where),
					]);
					return { items: items as TPayrollItemRow[], total };
				},
				catch: (cause) => new EDatabase({ cause }),
			});
		};

		const findItemById: TPayrollRepo["findItemById"] = (id) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.select()
						.from(payrollItem)
						.where(eq(payrollItem.id, id))
						.limit(1);
					return (row as TPayrollItemRow) ?? null;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		return PayrollRepo.of({
			createPeriod,
			findPeriodById,
			listPeriods,
			updatePeriod,
			calculatePeriod,
			listItems,
			findItemById,
			findTaxYtd,
		});
	}),
).pipe(Layer.provide(dbServiceLayer));
