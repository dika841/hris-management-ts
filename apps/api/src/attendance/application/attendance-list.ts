import type { TAttendanceList, TAttendanceListInput } from "@app/schemas";
import { Effect } from "effect";
import { toAttendanceLogDto } from "#/attendance/application/to-attendance-dto.ts";
import {
	AttendanceRepo,
	type TAttendanceRepoId,
} from "#/attendance/domain/attendance.ts";
import type { EDatabase } from "#/shared/errors.ts";

export const attendanceList = Effect.fn("attendanceList")(function* (
	input: TAttendanceListInput,
): Effect.fn.Return<TAttendanceList, EDatabase, TAttendanceRepoId> {
	const attendanceRepo = yield* AttendanceRepo;
	const { items, total } = yield* attendanceRepo.listAttendanceLogs(input);
	return {
		items: items.map(toAttendanceLogDto),
		total,
		page: input.page,
		pageSize: input.pageSize,
	};
});
