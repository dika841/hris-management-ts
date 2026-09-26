import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import type { TPosition, TPositionCreateInput } from "@app/schemas";
import { Effect } from "effect";
import { toPositionDto } from "#/employee/application/to-org-dto.ts";
import {
	EmployeeRepo,
	type TEmployeeRepoId,
} from "#/employee/domain/employee.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import type { EDatabase } from "#/shared/errors.ts";

export const positionCreate = Effect.fn("positionCreate")(function* (
	input: TPositionCreateInput,
	actorId: string,
): Effect.fn.Return<
	TPosition,
	EDatabase,
	TEmployeeRepoId | TActivityRecorderId
> {
	const employeeRepo = yield* EmployeeRepo;
	const activityRepo = yield* ActivityRecorder;

	const row = yield* employeeRepo.createPosition(input);

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.USER_CREATE,
		resourceType: ACTIVITY_RESOURCE_TYPE.POSITION,
		resourceId: row.id,
		metadata: { code: row.code, title: row.title },
	});

	return toPositionDto(row);
});
