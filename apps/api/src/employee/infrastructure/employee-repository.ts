import { D } from "@mobily/ts-belt";
import { and, asc, count, desc, eq, gte, lte, or, type SQL } from "drizzle-orm";
import { Effect, Layer } from "effect";
import { match, P } from "ts-pattern";
import { EMPLOYEE_SORT, type TEmployeeSort } from "@app/schemas";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import {
	EmployeeRepo,
	type TDepartmentRow,
	type TEmployeeCareerRow,
	type TEmployeeContractRow,
	type TEmployeeRepo,
	type TEmployeeRow,
	type TPositionRow,
} from "#/employee/domain/employee.ts";
import { DbService, dbServiceLayer } from "#/platform/db/db-service.ts";
import { containsWhere } from "#/platform/db/search.ts";
import {
	department,
	employee,
	employeeCareerHistory,
	employeeContract,
	position,
} from "#/platform/db/tables/employee.ts";
import { dbActive } from "#/platform/db/transaction.ts";
import { EDatabase } from "#/shared/errors.ts";
import { offsetFor, orderFor } from "#/shared/pagination.ts";

const SORT_COLUMN: Record<TEmployeeSort, AnyPgColumn> = {
	[EMPLOYEE_SORT.EMPLOYEE_CODE]: employee.employeeCode,
	[EMPLOYEE_SORT.FULL_NAME]: employee.fullName,
	[EMPLOYEE_SORT.DEPARTMENT]: employee.department,
	[EMPLOYEE_SORT.POSITION]: employee.position,
	[EMPLOYEE_SORT.JOIN_DATE]: employee.joinDate,
	[EMPLOYEE_SORT.CREATED_AT]: employee.createdAt,
};

const searchWhere = (search: string | undefined): SQL | undefined =>
	match(search)
		.with(P.nonNullable, (value) =>
			or(
				containsWhere(employee.fullName, value),
				containsWhere(employee.employeeCode, value),
				containsWhere(employee.department, value),
			),
		)
		.otherwise(() => undefined);

const departmentWhere = (dept: string | undefined): SQL | undefined =>
	match(dept)
		.with(P.nonNullable, (value) => eq(employee.department, value))
		.otherwise(() => undefined);

const statusWhere = (status: string | undefined): SQL | undefined =>
	match(status)
		.with(P.nonNullable, (value) => eq(employee.employmentStatus, value))
		.otherwise(() => undefined);

export const employeeRepoLayer = Layer.effect(
	EmployeeRepo,
	Effect.gen(function* () {
		const { db } = yield* DbService;

		const list: TEmployeeRepo["list"] = ({
			page,
			pageSize,
			search,
			department: dept,
			employmentStatus,
			sortBy,
			sortDir,
		}) => {
			const where = and(
				searchWhere(search),
				departmentWhere(dept),
				statusWhere(employmentStatus),
			);

			return Effect.tryPromise({
				try: async () => {
					const [items, [{ value: total }]] = await Promise.all([
						dbActive(db)
							.select()
							.from(employee)
							.where(where)
							.limit(pageSize)
							.offset(offsetFor({ page, pageSize }))
							.orderBy(orderFor(SORT_COLUMN[sortBy], sortDir)),
						dbActive(db).select({ value: count() }).from(employee).where(where),
					]);
					return { items: items as TEmployeeRow[], total };
				},
				catch: (cause) => new EDatabase({ cause }),
			});
		};

		const findById: TEmployeeRepo["findById"] = (id) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.select()
						.from(employee)
						.where(eq(employee.id, id))
						.limit(1);
					return (row as TEmployeeRow) ?? null;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const findByCode: TEmployeeRepo["findByCode"] = (code) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.select()
						.from(employee)
						.where(eq(employee.employeeCode, code))
						.limit(1);
					return (row as TEmployeeRow) ?? null;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const findByEmail: TEmployeeRepo["findByEmail"] = (email) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.select()
						.from(employee)
						.where(eq(employee.email, email.toLowerCase()))
						.limit(1);
					return (row as TEmployeeRow) ?? null;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const findByUserId: TEmployeeRepo["findByUserId"] = (userId) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.select()
						.from(employee)
						.where(eq(employee.userId, userId))
						.limit(1);
					return (row as TEmployeeRow) ?? null;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const create: TEmployeeRepo["create"] = (input) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.insert(employee)
						.values({
							userId: input.userId ?? null,
							employeeCode: input.employeeCode,
							idCardNumber: input.idCardNumber,
							fullName: input.fullName,
							email: input.email.toLowerCase(),
							phone: input.phone ?? null,
							gender: input.gender,
							dateOfBirth: input.dateOfBirth,
							departmentId: input.departmentId ?? null,
							department: input.department,
							positionId: input.positionId ?? null,
							position: input.position,
							employmentStatus: input.employmentStatus,
							workScheduleType: input.workScheduleType,
							workStartTime: input.workStartTime,
							workEndTime: input.workEndTime,
							joinDate: input.joinDate,
							endDate: input.endDate ?? null,
							managerId: input.managerId ?? null,
							basicSalary: input.basicSalary,
							taxMethod: input.taxMethod,
							ptkpCode: input.ptkpCode,
							npwp: input.npwp ?? null,
							bankName: input.bankName ?? null,
							bankAccountNumber: input.bankAccountNumber ?? null,
							bankAccountHolder: input.bankAccountHolder ?? null,
							bpjsKesehatanNumber: input.bpjsKesehatanNumber ?? null,
							bpjsKetenagakerjaanNumber:
								input.bpjsKetenagakerjaanNumber ?? null,
							jkkRiskGrade: input.jkkRiskGrade,
							pdpConsentGiven: input.pdpConsentGiven,
							pdpConsentDate: input.pdpConsentGiven ? new Date() : undefined,
						})
						.returning();
					return row as TEmployeeRow;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const update: TEmployeeRepo["update"] = ({ id, ...patch }) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.update(employee)
						.set(
							D.merge(patch, {
								updatedAt: new Date(),
								...(patch.email ? { email: patch.email.toLowerCase() } : {}),
								...(patch.pdpConsentGiven === true
									? { pdpConsentDate: new Date() }
									: {}),
								...(patch.pdpConsentGiven === false
									? { pdpConsentDate: null }
									: {}),
							}),
						)
						.where(eq(employee.id, id))
						.returning();
					return (row as TEmployeeRow) ?? null;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const remove: TEmployeeRepo["remove"] = (id) =>
			Effect.tryPromise({
				try: async () => {
					const result = await dbActive(db)
						.delete(employee)
						.where(eq(employee.id, id))
						.returning({ id: employee.id });
					return result.length > 0;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		// Contracts
		const listContracts: TEmployeeRepo["listContracts"] = (employeeId) =>
			Effect.tryPromise({
				try: async () => {
					const rows = await dbActive(db)
						.select()
						.from(employeeContract)
						.where(eq(employeeContract.employeeId, employeeId))
						.orderBy(desc(employeeContract.startDate));
					return rows as TEmployeeContractRow[];
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const findContractById: TEmployeeRepo["findContractById"] = (id) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.select()
						.from(employeeContract)
						.where(eq(employeeContract.id, id))
						.limit(1);
					return (row as TEmployeeContractRow) ?? null;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const createContract: TEmployeeRepo["createContract"] = (data) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.insert(employeeContract)
						.values(data)
						.returning();
					return row as TEmployeeContractRow;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const updateContract: TEmployeeRepo["updateContract"] = (id, patch) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.update(employeeContract)
						.set({ ...patch, updatedAt: new Date() })
						.where(eq(employeeContract.id, id))
						.returning();
					return (row as TEmployeeContractRow) ?? null;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const listExpiringContracts: TEmployeeRepo["listExpiringContracts"] = (
			days,
		) =>
			Effect.tryPromise({
				try: async () => {
					const today = new Date().toISOString().slice(0, 10);
					const targetDate = new Date(Date.now() + days * 86400000)
						.toISOString()
						.slice(0, 10);
					const rows = await dbActive(db)
						.select()
						.from(employeeContract)
						.where(
							and(
								eq(employeeContract.status, "active"),
								gte(employeeContract.endDate, today),
								lte(employeeContract.endDate, targetDate),
							),
						)
						.orderBy(asc(employeeContract.endDate));
					return rows as TEmployeeContractRow[];
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		// Career History
		const listCareerHistory: TEmployeeRepo["listCareerHistory"] = (
			employeeId,
		) =>
			Effect.tryPromise({
				try: async () => {
					const rows = await dbActive(db)
						.select()
						.from(employeeCareerHistory)
						.where(eq(employeeCareerHistory.employeeId, employeeId))
						.orderBy(desc(employeeCareerHistory.effectiveDate));
					return rows as TEmployeeCareerRow[];
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const createCareerHistory: TEmployeeRepo["createCareerHistory"] = (data) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.insert(employeeCareerHistory)
						.values(data)
						.returning();
					return row as TEmployeeCareerRow;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		// Organization
		const listDepartments: TEmployeeRepo["listDepartments"] = () =>
			Effect.tryPromise({
				try: async () => {
					const rows = await dbActive(db)
						.select()
						.from(department)
						.orderBy(asc(department.name));
					return rows as TDepartmentRow[];
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const createDepartment: TEmployeeRepo["createDepartment"] = (data) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.insert(department)
						.values(data)
						.returning();
					return row as TDepartmentRow;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const listPositions: TEmployeeRepo["listPositions"] = () =>
			Effect.tryPromise({
				try: async () => {
					const rows = await dbActive(db)
						.select()
						.from(position)
						.orderBy(asc(position.title));
					return rows as TPositionRow[];
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const createPosition: TEmployeeRepo["createPosition"] = (data) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.insert(position)
						.values(data)
						.returning();
					return row as TPositionRow;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const stats: TEmployeeRepo["stats"] = () =>
			Effect.tryPromise({
				try: async () => {
					const countBy = (where?: SQL) =>
						dbActive(db)
							.select({ value: count() })
							.from(employee)
							.where(where)
							.then(([row]) => row?.value ?? 0);

					const [
						total,
						permanent,
						contract,
						probation,
						intern,
						pdpConsent,
						taxMethodGross,
						taxMethodGrossUp,
						taxMethodNett,
					] = await Promise.all([
						countBy(),
						countBy(eq(employee.employmentStatus, "permanent")),
						countBy(eq(employee.employmentStatus, "contract")),
						countBy(eq(employee.employmentStatus, "probation")),
						countBy(eq(employee.employmentStatus, "intern")),
						countBy(eq(employee.pdpConsentGiven, true)),
						countBy(eq(employee.taxMethod, "gross")),
						countBy(eq(employee.taxMethod, "gross_up")),
						countBy(eq(employee.taxMethod, "nett")),
					]);

					return {
						total,
						permanent,
						contract,
						probation,
						intern,
						pdpConsent,
						taxMethodGross,
						taxMethodGrossUp,
						taxMethodNett,
					};
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		return EmployeeRepo.of({
			list,
			findById,
			findByCode,
			findByEmail,
			findByUserId,
			create,
			update,
			remove,
			stats,
			listContracts,
			findContractById,
			createContract,
			updateContract,
			listExpiringContracts,
			listCareerHistory,
			createCareerHistory,
			listDepartments,
			createDepartment,
			listPositions,
			createPosition,
		});
	}),
).pipe(Layer.provide(dbServiceLayer));
