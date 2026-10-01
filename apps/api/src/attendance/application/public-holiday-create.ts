import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { ATTENDANCE_MESSAGE } from "@app/messages";
import type { TPublicHoliday, TPublicHolidayCreateInput } from "@app/schemas";
import { Effect } from "effect";
import { toPublicHolidayDto } from "#/attendance/application/to-attendance-dto.ts";
import {
	AttendanceRepo,
	type TAttendanceRepoId,
} from "#/attendance/domain/attendance.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import { EConflict, type EDatabase } from "#/shared/errors.ts";

export const publicHolidayCreate = Effect.fn("publicHolidayCreate")(function* (
	input: TPublicHolidayCreateInput,
	actorId: string,
): Effect.fn.Return<
	TPublicHoliday,
	EConflict | EDatabase,
	TAttendanceRepoId | TActivityRecorderId
> {
	const attendanceRepo = yield* AttendanceRepo;
	const activityRepo = yield* ActivityRecorder;

	const existing = yield* attendanceRepo.findHolidayByDate(input.date);
	if (existing !== null) {
		return yield* new EConflict({
			message: ATTENDANCE_MESSAGE.HOLIDAY_DATE_TAKEN,
		});
	}

	const year = new Date(input.date).getFullYear();
	const row = yield* attendanceRepo.createPublicHoliday({
		date: input.date,
		name: input.name,
		type: input.type ?? "national",
		year,
		description: input.description ?? null,
	});

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.PUBLIC_HOLIDAY_CREATE,
		resourceType: ACTIVITY_RESOURCE_TYPE.PUBLIC_HOLIDAY,
		resourceId: row.id,
		metadata: { date: input.date, name: input.name },
	});

	return toPublicHolidayDto(row);
});
