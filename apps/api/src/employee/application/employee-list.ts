import type { TEmployeeList, TEmployeeListInput } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { Effect } from "effect";
import { toEmployeeDto } from "#/employee/application/to-employee-dto.ts";
import {
	EmployeeRepo,
	type TEmployeeRepoId,
} from "#/employee/domain/employee.ts";
import type { EDatabase } from "#/shared/errors.ts";

export const employeeList = Effect.fn("employeeList")(function* (
	input: TEmployeeListInput,
): Effect.fn.Return<TEmployeeList, EDatabase, TEmployeeRepoId> {
	const employeeRepo = yield* EmployeeRepo;
	const { items, total } = yield* employeeRepo.list(input);

	return {
		items: A.map(items, toEmployeeDto),
		total,
		page: input.page,
		pageSize: input.pageSize,
	};
});
