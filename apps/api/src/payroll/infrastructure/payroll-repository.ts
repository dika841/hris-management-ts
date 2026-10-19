import {
	and,
	asc,
	count,
	desc,
	eq,
	gte,
	inArray,
	isNull,
	lt,
	lte,
	or,
	type SQL,
} from "drizzle-orm";
import { Effect, Layer } from "effect";
import { match, P } from "ts-pattern";
import { PAYROLL_SORT, type TPayrollSort } from "@app/schemas";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { calculatePayroll } from "#/payroll/domain/payroll-calculator.ts";
import {
	PayrollRepo,
	type TEmployeeTaxYtdRow,
	type TPayrollBankRow,
	type TPayrollComponentRow,
	type TPayrollItemRow,
	type TPayrollPeriodRow,
	type TPayrollRepo,
} from "#/payroll/domain/payroll.ts";
import { DbService, dbServiceLayer } from "#/platform/db/db-service.ts";
import { containsWhere } from "#/platform/db/search.ts";
import {
	attendanceLog,
	leaveRequest,
	overtimeRequest,
} from "#/platform/db/tables/attendance.ts";
import { employee, employeeContract } from "#/platform/db/tables/employee.ts";
import {
	employeeTaxYtd,
	payrollComponent,
	payrollItem,
	payrollPeriod,
} from "#/platform/db/tables/payroll.ts";
import { dbActive } from "#/platform/db/transaction.ts";
import { EDatabase } from "#/shared/errors.ts";
import { offsetFor, orderFor } from "#/shared/pagination.ts";

const WORKING_DAYS_PER_MONTH = 22;

const workdayCount = (start: string, end: string): number => {
	const from = new Date(`${start}T00:00:00Z`);
	const to = new Date(`${end}T00:00:00Z`);
	if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 0;

	let days = 0;
	for (
		const cursor = new Date(from);
		cursor <= to;
		cursor.setUTCDate(cursor.getUTCDate() + 1)
	) {
		const day = cursor.getUTCDay();
		if (day !== 0 && day !== 6) days += 1;
	}
	return days;
};

const overlapWorkdays = (
	startA: string,
	endA: string,
	startB: string,
	endB: string,
): number => {
	const start = startA > startB ? startA : startB;
	const end = endA < endB ? endA : endB;
	return start > end ? 0 : workdayCount(start, end);
};

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
					const activeDb = dbActive(db);
					const [periodRow] = await activeDb
						.select()
						.from(payrollPeriod)
						.where(eq(payrollPeriod.id, periodId))
						.limit(1);

					if (!periodRow) {
						throw new Error("Period not found");
					}

					const employees = await activeDb
						.select()
						.from(employee)
						.where(
							and(
								lte(employee.joinDate, periodRow.endDate),
								or(
									isNull(employee.endDate),
									gte(employee.endDate, periodRow.startDate),
								),
								employeeIds && employeeIds.length > 0
									? inArray(employee.id, employeeIds)
									: undefined,
							),
						);

					const contracts = await activeDb
						.select({
							employeeId: employeeContract.employeeId,
							fixedAllowance: employeeContract.fixedAllowance,
						})
						.from(employeeContract)
						.where(
							and(
								eq(employeeContract.status, "active"),
								lte(employeeContract.startDate, periodRow.endDate),
								or(
									isNull(employeeContract.endDate),
									gte(employeeContract.endDate, periodRow.startDate),
								),
							),
						)
						.orderBy(desc(employeeContract.startDate));

					const allowanceByEmployee = new Map<string, number>();
					for (const contract of contracts) {
						if (!allowanceByEmployee.has(contract.employeeId)) {
							allowanceByEmployee.set(
								contract.employeeId,
								contract.fixedAllowance,
							);
						}
					}

					const overtimeByEmployee = new Map<
						string,
						{ minutes: number; amount: number }
					>();
					const overtimeRows = await activeDb
						.select({
							employeeId: overtimeRequest.employeeId,
							durationMinutes: overtimeRequest.durationMinutes,
							calculatedAmount: overtimeRequest.calculatedAmount,
						})
						.from(overtimeRequest)
						.where(
							and(
								eq(overtimeRequest.status, "approved"),
								gte(overtimeRequest.overtimeDate, periodRow.startDate),
								lte(overtimeRequest.overtimeDate, periodRow.endDate),
							),
						);
					for (const row of overtimeRows) {
						const current = overtimeByEmployee.get(row.employeeId) ?? {
							minutes: 0,
							amount: 0,
						};
						overtimeByEmployee.set(row.employeeId, {
							minutes: current.minutes + row.durationMinutes,
							amount: current.amount + row.calculatedAmount,
						});
					}

					const leaveRows = await activeDb
						.select({
							employeeId: leaveRequest.employeeId,
							startDate: leaveRequest.startDate,
							endDate: leaveRequest.endDate,
							salaryPercentageAtTime: leaveRequest.salaryPercentageAtTime,
						})
						.from(leaveRequest)
						.where(
							and(
								eq(leaveRequest.status, "approved"),
								lte(leaveRequest.startDate, periodRow.endDate),
								gte(leaveRequest.endDate, periodRow.startDate),
							),
						);

					const absenceRows = await activeDb
						.select({
							employeeId: attendanceLog.employeeId,
							attendanceDate: attendanceLog.attendanceDate,
						})
						.from(attendanceLog)
						.where(
							and(
								eq(attendanceLog.status, "absent"),
								gte(attendanceLog.attendanceDate, periodRow.startDate),
								lte(attendanceLog.attendanceDate, periodRow.endDate),
							),
						);

					const absenceCountByEmployee = new Map<string, number>();
					for (const row of absenceRows) {
						absenceCountByEmployee.set(
							row.employeeId,
							(absenceCountByEmployee.get(row.employeeId) ?? 0) + 1,
						);
					}

					const componentRows = await activeDb
						.select()
						.from(payrollComponent)
						.where(eq(payrollComponent.payrollPeriodId, periodId));
					const componentsByEmployee = new Map<
						string,
						TPayrollComponentRow[]
					>();
					for (const component of componentRows) {
						const current =
							componentsByEmployee.get(component.employeeId) ?? [];
						componentsByEmployee.set(component.employeeId, [
							...current,
							component as TPayrollComponentRow,
						]);
					}

					const priorItems =
						periodRow.month === 12
							? await activeDb
									.select({
										employeeId: payrollItem.employeeId,
										grossTotal: payrollItem.grossTotal,
										taxBreakdown: payrollItem.taxBreakdown,
										bpjsBreakdown: payrollItem.bpjsBreakdown,
									})
									.from(payrollItem)
									.innerJoin(
										payrollPeriod,
										eq(payrollItem.payrollPeriodId, payrollPeriod.id),
									)
									.where(
										and(
											eq(payrollPeriod.year, periodRow.year),
											lt(payrollPeriod.month, periodRow.month),
										),
									)
							: [];

					const ytdByEmployee = new Map<
						string,
						{
							gross: number;
							pph21: number;
							jhtEmployee: number;
							jpEmployee: number;
						}
					>();
					for (const item of priorItems) {
						const current = ytdByEmployee.get(item.employeeId) ?? {
							gross: 0,
							pph21: 0,
							jhtEmployee: 0,
							jpEmployee: 0,
						};
						ytdByEmployee.set(item.employeeId, {
							gross: current.gross + item.grossTotal,
							pph21: current.pph21 + item.taxBreakdown.pph21Monthly,
							jhtEmployee: current.jhtEmployee + item.bpjsBreakdown.jhtEmployee,
							jpEmployee: current.jpEmployee + item.bpjsBreakdown.jpEmployee,
						});
					}

					// Hapus item kalkulasi periode lama bila sudah ada
					await activeDb
						.delete(payrollItem)
						.where(eq(payrollItem.payrollPeriodId, periodId));

					let totalGross = 0;
					let totalPph21 = 0;
					let totalNetPay = 0;
					let processed = 0;
					const currentYtd = new Map<
						string,
						{
							gross: number;
							pph21: number;
							jhtEmployee: number;
							jpEmployee: number;
						}
					>();

					for (const emp of employees) {
						const components = componentsByEmployee.get(emp.id) ?? [];
						const componentTotal = (
							type: (typeof components)[number]["type"],
						): number =>
							components
								.filter((component) => component.type === type)
								.reduce((total, component) => total + component.amount, 0);

						const allowance =
							(allowanceByEmployee.get(emp.id) ?? 0) +
							componentTotal("allowance");
						const bonus =
							componentTotal("bonus") +
							componentTotal("thr") +
							componentTotal("thirteenth_month");
						const natura = componentTotal("natura");
						const componentDeduction = componentTotal("deduction");
						const overtime = overtimeByEmployee.get(emp.id) ?? {
							minutes: 0,
							amount: 0,
						};
						const dailyWage = Math.round(
							emp.basicSalary / WORKING_DAYS_PER_MONTH,
						);
						const absenceDeduction =
							dailyWage * (absenceCountByEmployee.get(emp.id) ?? 0);
						const leaveDeduction = leaveRows
							.filter((leave) => leave.employeeId === emp.id)
							.reduce((total, leave) => {
								const days = overlapWorkdays(
									leave.startDate,
									leave.endDate,
									periodRow.startDate,
									periodRow.endDate,
								);
								const deductionRate =
									(100 - leave.salaryPercentageAtTime) / 100;
								return total + Math.round(dailyWage * days * deductionRate);
							}, 0);
						const otherDeductions =
							absenceDeduction + leaveDeduction + componentDeduction;

						const ytd = ytdByEmployee.get(emp.id);
						const ytdContext =
							periodRow.month === 12
								? {
										ytdGrossJanToNov: ytd?.gross ?? 0,
										ytdPph21JanToNov: ytd?.pph21 ?? 0,
										ytdJhtEmployeeJanToNov: ytd?.jhtEmployee ?? 0,
										ytdJpEmployeeJanToNov: ytd?.jpEmployee ?? 0,
									}
								: undefined;

						const calc = calculatePayroll({
							basicSalary: emp.basicSalary,
							ptkpCode: emp.ptkpCode as any,
							taxMethod: emp.taxMethod as any,
							allowances: allowance,
							overtimePay: overtime.amount,
							bonus,
							natura,
							otherDeductions,
							jkkRiskGrade: emp.jkkRiskGrade,
							month: periodRow.month,
							ytdContext,
						});

						const deductionNote =
							otherDeductions > 0
								? `Potongan ketidakhadiran Rp ${absenceDeduction.toLocaleString("id-ID")}, potongan cuti tidak berbayar Rp ${leaveDeduction.toLocaleString("id-ID")}, potongan komponen Rp ${componentDeduction.toLocaleString("id-ID")}.`
								: null;

						await activeDb.insert(payrollItem).values({
							payrollPeriodId: periodId,
							employeeId: emp.id,
							employeeCode: emp.employeeCode,
							employeeName: emp.fullName,
							department: emp.department,
							position: emp.position,
							basicSalary: calc.basicSalary,
							allowanceTotal: calc.allowances,
							overtimeHours: overtime.minutes / 60,
							overtimePay: calc.overtimePay,
							bonusTotal: calc.bonus,
							naturaTotal: calc.natura,
							taxAllowance: calc.taxAllowance,
							grossTotal: calc.cashGross,
							bpjsBreakdown: calc.bpjs,
							taxBreakdown: calc.tax,
							deductionTotal: calc.totalEmployeeDeductions,
							netPay: calc.netPay,
							calculationLog: [calc.explanation, deductionNote]
								.filter(Boolean)
								.join(" "),
						});

						const previous = currentYtd.get(emp.id) ?? {
							gross: 0,
							pph21: 0,
							jhtEmployee: 0,
							jpEmployee: 0,
						};
						currentYtd.set(emp.id, {
							gross: previous.gross + calc.cashGross,
							pph21: previous.pph21 + calc.tax.pph21Monthly,
							jhtEmployee: previous.jhtEmployee + calc.bpjs.jhtEmployee,
							jpEmployee: previous.jpEmployee + calc.bpjs.jpEmployee,
						});

						totalGross += calc.cashGross;
						totalPph21 += calc.tax.pph21Monthly;
						totalNetPay += calc.netPay;
						processed += 1;
					}

					// Simpan akumulasi tahun berjalan agar rekonsiliasi berikutnya konsisten.
					const existingYtd = await activeDb
						.select()
						.from(employeeTaxYtd)
						.where(eq(employeeTaxYtd.taxYear, periodRow.year));
					const existingYtdByEmployee = new Map(
						existingYtd.map((row) => [row.employeeId, row]),
					);

					for (const emp of employees) {
						const prior = ytdByEmployee.get(emp.id) ?? {
							gross: 0,
							pph21: 0,
							jhtEmployee: 0,
							jpEmployee: 0,
						};
						const current = currentYtd.get(emp.id) ?? {
							gross: 0,
							pph21: 0,
							jhtEmployee: 0,
							jpEmployee: 0,
						};
						const values = {
							employeeId: emp.id,
							taxYear: periodRow.year,
							totalGross: prior.gross + current.gross,
							totalPph21Paid: prior.pph21 + current.pph21,
							totalJhtEmployee: prior.jhtEmployee + current.jhtEmployee,
							totalJpEmployee: prior.jpEmployee + current.jpEmployee,
							updatedAt: new Date(),
						};
						const existing = existingYtdByEmployee.get(emp.id);
						if (existing) {
							await activeDb
								.update(employeeTaxYtd)
								.set(values)
								.where(eq(employeeTaxYtd.id, existing.id));
						} else {
							await activeDb.insert(employeeTaxYtd).values(values);
						}
					}

					// Update rangkuman periode
					const [updatedPeriod] = await activeDb
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
				search ? containsWhere(payrollItem.employeeName, search) : undefined,
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

		const listAllItems: TPayrollRepo["listAllItems"] = (periodId) =>
			Effect.tryPromise({
				try: async () => {
					const rows = await dbActive(db)
						.select()
						.from(payrollItem)
						.where(eq(payrollItem.payrollPeriodId, periodId))
						.orderBy(asc(payrollItem.employeeName));
					return rows as TPayrollItemRow[];
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const listItemsByEmployee: TPayrollRepo["listItemsByEmployee"] = (
			employeeId,
		) =>
			Effect.tryPromise({
				try: async () => {
					const rows = await dbActive(db)
						.select()
						.from(payrollItem)
						.where(eq(payrollItem.employeeId, employeeId))
						.orderBy(desc(payrollItem.createdAt));
					return rows as TPayrollItemRow[];
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const listComponents: TPayrollRepo["listComponents"] = (periodId) =>
			Effect.tryPromise({
				try: async () => {
					const rows = await dbActive(db)
						.select()
						.from(payrollComponent)
						.where(eq(payrollComponent.payrollPeriodId, periodId))
						.orderBy(desc(payrollComponent.createdAt));
					return rows as TPayrollComponentRow[];
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const listItemComponents: TPayrollRepo["listItemComponents"] = (
			periodId,
			employeeId,
		) =>
			Effect.tryPromise({
				try: async () => {
					const rows = await dbActive(db)
						.select()
						.from(payrollComponent)
						.where(
							and(
								eq(payrollComponent.payrollPeriodId, periodId),
								eq(payrollComponent.employeeId, employeeId),
							),
						)
						.orderBy(desc(payrollComponent.createdAt));
					return rows as TPayrollComponentRow[];
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const createComponent: TPayrollRepo["createComponent"] = (data) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.insert(payrollComponent)
						.values(data)
						.returning();
					return row as TPayrollComponentRow;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const findComponentById: TPayrollRepo["findComponentById"] = (id) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.select()
						.from(payrollComponent)
						.where(eq(payrollComponent.id, id))
						.limit(1);
					return (row as TPayrollComponentRow) ?? null;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const removeComponent: TPayrollRepo["removeComponent"] = (id) =>
			Effect.tryPromise({
				try: async () => {
					const rows = await dbActive(db)
						.delete(payrollComponent)
						.where(eq(payrollComponent.id, id))
						.returning({ id: payrollComponent.id });
					return rows.length > 0;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const listBankRows: TPayrollRepo["listBankRows"] = (periodId) =>
			Effect.tryPromise({
				try: async () => {
					const rows = await dbActive(db)
						.select({
							employeeId: payrollItem.employeeId,
							employeeCode: payrollItem.employeeCode,
							employeeName: payrollItem.employeeName,
							bankName: employee.bankName,
							bankAccountNumber: employee.bankAccountNumber,
							bankAccountHolder: employee.bankAccountHolder,
							netPay: payrollItem.netPay,
						})
						.from(payrollItem)
						.innerJoin(employee, eq(payrollItem.employeeId, employee.id))
						.where(eq(payrollItem.payrollPeriodId, periodId));
					return rows as TPayrollBankRow[];
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
			listAllItems,
			listItemsByEmployee,
			listComponents,
			listItemComponents,
			createComponent,
			findComponentById,
			removeComponent,
			listBankRows,
			findTaxYtd,
		});
	}),
).pipe(Layer.provide(dbServiceLayer));
