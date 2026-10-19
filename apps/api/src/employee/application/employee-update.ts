import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { EMPLOYEE_MESSAGE } from "@app/messages";
import type { TEmployee, TEmployeeUpdateInput } from "@app/schemas";
import { Effect } from "effect";
import { toEmployeeDto } from "#/employee/application/to-employee-dto.ts";
import {
	EmployeeRepo,
	type TEmployeeRepoId,
} from "#/employee/domain/employee.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import { EConflict, type EDatabase, ENotFound } from "#/shared/errors.ts";

export const employeeUpdate = Effect.fn("employeeUpdate")(function* (
	input: TEmployeeUpdateInput,
	actorId: string,
): Effect.fn.Return<
	TEmployee,
	ENotFound | EConflict | EDatabase,
	TEmployeeRepoId | TActivityRecorderId
> {
	const employeeRepo = yield* EmployeeRepo;
	const activityRepo = yield* ActivityRecorder;

	if (input.userId) {
		const existingLink = yield* employeeRepo.findByUserId(input.userId);
		if (existingLink !== null && existingLink.id !== input.id) {
			return yield* new EConflict({
				message: EMPLOYEE_MESSAGE.USER_ALREADY_LINKED,
			});
		}
	}

	const row = yield* employeeRepo.update(input);

	if (row === null) {
		return yield* new ENotFound({ message: EMPLOYEE_MESSAGE.NOT_FOUND });
	}

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.EMPLOYEE_UPDATE,
		resourceType: ACTIVITY_RESOURCE_TYPE.EMPLOYEE,
		resourceId: row.id,
		metadata: {
			employeeCode: row.employeeCode,
		},
	});

	return toEmployeeDto(row);
});
