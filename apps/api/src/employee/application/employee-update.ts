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
import { type EDatabase, ENotFound } from "#/shared/errors.ts";

export const employeeUpdate = Effect.fn("employeeUpdate")(function* (
	input: TEmployeeUpdateInput,
	actorId: string,
): Effect.fn.Return<
	TEmployee,
	ENotFound | EDatabase,
	TEmployeeRepoId | TActivityRecorderId
> {
	const employeeRepo = yield* EmployeeRepo;
	const activityRepo = yield* ActivityRecorder;

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
