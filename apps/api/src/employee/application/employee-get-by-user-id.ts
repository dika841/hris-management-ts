import { EMPLOYEE_MESSAGE } from "@app/messages";
import type { TEmployee } from "@app/schemas";
import { Effect } from "effect";
import { toEmployeeDto } from "#/employee/application/to-employee-dto.ts";
import {
	EmployeeRepo,
	type TEmployeeRepoId,
} from "#/employee/domain/employee.ts";
import { type EDatabase, ENotFound } from "#/shared/errors.ts";

export const employeeGetByUserId = Effect.fn("employeeGetByUserId")(function* (
	userId: string,
): Effect.fn.Return<TEmployee, ENotFound | EDatabase, TEmployeeRepoId> {
	const employeeRepo = yield* EmployeeRepo;
	const row = yield* employeeRepo.findByUserId(userId);
	if (row === null) {
		return yield* new ENotFound({ message: EMPLOYEE_MESSAGE.SELF_NOT_LINKED });
	}
	return toEmployeeDto(row);
});
