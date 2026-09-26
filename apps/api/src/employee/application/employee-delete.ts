import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { EMPLOYEE_MESSAGE } from "@app/messages";
import type { TEmployeeIdInput } from "@app/schemas";
import { Effect } from "effect";
import {
	EmployeeRepo,
	type TEmployeeRepoId,
} from "#/employee/domain/employee.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import { type EDatabase, ENotFound } from "#/shared/errors.ts";

export const employeeDelete = Effect.fn("employeeDelete")(function* (
	input: TEmployeeIdInput,
	actorId: string,
): Effect.fn.Return<
	{ id: string },
	ENotFound | EDatabase,
	TEmployeeRepoId | TActivityRecorderId
> {
	const employeeRepo = yield* EmployeeRepo;
	const activityRepo = yield* ActivityRecorder;

	const deleted = yield* employeeRepo.remove(input.id);

	if (!deleted) {
		return yield* new ENotFound({ message: EMPLOYEE_MESSAGE.NOT_FOUND });
	}

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.EMPLOYEE_DELETE,
		resourceType: ACTIVITY_RESOURCE_TYPE.EMPLOYEE,
		resourceId: input.id,
	});

	return { id: input.id };
});
