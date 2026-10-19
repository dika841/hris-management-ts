import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { ATTENDANCE_MESSAGE } from "@app/messages";
import type { TPublicHolidayDeleteInput } from "@app/schemas";
import { Effect } from "effect";
import {
	AttendanceRepo,
	type TAttendanceRepoId,
} from "#/attendance/domain/attendance.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import { ENotFound, type EDatabase } from "#/shared/errors.ts";

export const publicHolidayDelete = Effect.fn("publicHolidayDelete")(function* (
	input: TPublicHolidayDeleteInput,
	actorId: string,
): Effect.fn.Return<
	{ id: string },
	ENotFound | EDatabase,
	TAttendanceRepoId | TActivityRecorderId
> {
	const attendanceRepo = yield* AttendanceRepo;
	const activityRepo = yield* ActivityRecorder;

	const deleted = yield* attendanceRepo.deletePublicHoliday(input.id);
	if (!deleted) {
		return yield* new ENotFound({
			message: ATTENDANCE_MESSAGE.HOLIDAY_NOT_FOUND,
		});
	}

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.PUBLIC_HOLIDAY_DELETE,
		resourceType: ACTIVITY_RESOURCE_TYPE.PUBLIC_HOLIDAY,
		resourceId: input.id,
	});

	return { id: input.id };
});
