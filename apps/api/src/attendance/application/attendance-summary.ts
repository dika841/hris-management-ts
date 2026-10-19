import type { TAttendanceSummary } from "@app/schemas";
import { Effect } from "effect";
import {
	AttendanceRepo,
	type TAttendanceRepoId,
} from "#/attendance/domain/attendance.ts";
import type { EDatabase } from "#/shared/errors.ts";

export type TAttendanceSummaryInput = {
	employeeId: string;
	month: number;
	year: number;
};

export const attendanceSummary = Effect.fn("attendanceSummary")(function* (
	input: TAttendanceSummaryInput,
): Effect.fn.Return<TAttendanceSummary, EDatabase, TAttendanceRepoId> {
	const attendanceRepo = yield* AttendanceRepo;
	return yield* attendanceRepo.getAttendanceSummary(
		input.employeeId,
		input.month,
		input.year,
	);
});
