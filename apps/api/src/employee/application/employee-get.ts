import { EMPLOYEE_MESSAGE } from "@app/messages";
import type { TEmployee, TEmployeeIdInput } from "@app/schemas";
import { Effect } from "effect";
import { toEmployeeDto } from "#/employee/application/to-employee-dto.ts";
import {
	EmployeeRepo,
	type TEmployeeRepoId,
} from "#/employee/domain/employee.ts";
import { type EDatabase, ENotFound } from "#/shared/errors.ts";

export const employeeGet = Effect.fn("employeeGet")(function* (
	input: TEmployeeIdInput,
): Effect.fn.Return<TEmployee, ENotFound | EDatabase, TEmployeeRepoId> {
	const employeeRepo = yield* EmployeeRepo;
	const row = yield* employeeRepo.findById(input.id);

	if (row === null) {
		return yield* new ENotFound({ message: EMPLOYEE_MESSAGE.NOT_FOUND });
	}

	return toEmployeeDto(row);
});
