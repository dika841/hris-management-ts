import { EMPLOYEE_MESSAGE } from "@app/messages";
import { Effect } from "effect";
import {
	EmployeeRepo,
	type TEmployeeRepoId,
	type TEmployeeRow,
} from "#/employee/index.ts";
import { EConflict, type EDatabase } from "#/shared/errors.ts";

export const resolveSelfEmployee = Effect.fn("resolveSelfEmployee")(function* (
	userId: string,
): Effect.fn.Return<TEmployeeRow, EConflict | EDatabase, TEmployeeRepoId> {
	const employeeRepo = yield* EmployeeRepo;
	const employee = yield* employeeRepo.findByUserId(userId);
	if (employee === null) {
		return yield* new EConflict({ message: EMPLOYEE_MESSAGE.SELF_NOT_LINKED });
	}
	return employee;
});
