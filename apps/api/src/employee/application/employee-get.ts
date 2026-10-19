import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { EMPLOYEE_MESSAGE } from "@app/messages";
import type { TEmployee, TEmployeeIdInput } from "@app/schemas";
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

export const employeeGet = Effect.fn("employeeGet")(function* (
	input: TEmployeeIdInput,
	maskSensitive = false,
	actorId = "system",
): Effect.fn.Return<
	TEmployee,
	ENotFound | EDatabase,
	TEmployeeRepoId | TActivityRecorderId
> {
	const employeeRepo = yield* EmployeeRepo;
	const activityRepo = yield* ActivityRecorder;
	const row = yield* employeeRepo.findById(input.id);

	if (row === null) {
		return yield* new ENotFound({ message: EMPLOYEE_MESSAGE.NOT_FOUND });
	}

	if (!maskSensitive) {
		yield* activityRepo.insert({
			actorId,
			action: ACTIVITY_ACTION.EMPLOYEE_SENSITIVE_READ,
			resourceType: ACTIVITY_RESOURCE_TYPE.EMPLOYEE,
			resourceId: row.id,
			metadata: { employeeCode: row.employeeCode },
		});
	}

	return toEmployeeDto(row, maskSensitive);
});
