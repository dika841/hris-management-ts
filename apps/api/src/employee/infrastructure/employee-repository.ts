import { D } from "@mobily/ts-belt";
import { and, count, eq, or, type SQL } from "drizzle-orm";
import { Effect, Layer } from "effect";
import { match, P } from "ts-pattern";
import { EMPLOYEE_SORT, type TEmployeeSort } from "@app/schemas";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import {
	EmployeeRepo,
	type TEmployeeRepo,
	type TEmployeeRow,
} from "#/employee/domain/employee.ts";
import { DbService, dbServiceLayer } from "#/platform/db/db-service.ts";
import { containsWhere } from "#/platform/db/search.ts";
import { employee } from "#/platform/db/tables/employee.ts";
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
			department,
			employmentStatus,
			sortBy,
			sortDir,
		}) => {
			const where = and(
				searchWhere(search),
				departmentWhere(department),
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
							department: input.department,
							position: input.position,
							employmentStatus: input.employmentStatus,
							joinDate: input.joinDate,
							endDate: input.endDate ?? null,
							basicSalary: input.basicSalary,
							taxMethod: input.taxMethod,
							ptkpCode: input.ptkpCode,
							npwp: input.npwp ?? null,
							bankName: input.bankName ?? null,
							bankAccountNumber: input.bankAccountNumber ?? null,
							bankAccountHolder: input.bankAccountHolder ?? null,
							bpjsKesehatanNumber: input.bpjsKesehatanNumber ?? null,
							bpjsKetenagakerjaanNumber: input.bpjsKetenagakerjaanNumber ?? null,
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

		return EmployeeRepo.of({
			list,
			findById,
			findByCode,
			findByEmail,
			create,
			update,
			remove,
		});
	}),
).pipe(Layer.provide(dbServiceLayer));
