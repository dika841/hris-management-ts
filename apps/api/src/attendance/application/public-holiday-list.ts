import type { TPublicHoliday, TPublicHolidayListInput } from "@app/schemas";
import { Effect } from "effect";
import { toPublicHolidayDto } from "#/attendance/application/to-attendance-dto.ts";
import {
	AttendanceRepo,
	type TAttendanceRepoId,
} from "#/attendance/domain/attendance.ts";
import type { EDatabase } from "#/shared/errors.ts";

export const publicHolidayList = Effect.fn("publicHolidayList")(function* (
	input: TPublicHolidayListInput,
): Effect.fn.Return<readonly TPublicHoliday[], EDatabase, TAttendanceRepoId> {
	const attendanceRepo = yield* AttendanceRepo;
	const rows = yield* attendanceRepo.listPublicHolidays(input.year);
	return rows.map(toPublicHolidayDto);
});
