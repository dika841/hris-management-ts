import type { TOvertimeList, TOvertimeListInput } from "@app/schemas";
import { Effect } from "effect";
import { toOvertimeRequestDto } from "#/attendance/application/to-attendance-dto.ts";
import {
	AttendanceRepo,
	type TAttendanceRepoId,
} from "#/attendance/domain/attendance.ts";
import type { EDatabase } from "#/shared/errors.ts";

export const overtimeList = Effect.fn("overtimeList")(function* (
	input: TOvertimeListInput,
): Effect.fn.Return<TOvertimeList, EDatabase, TAttendanceRepoId> {
	const attendanceRepo = yield* AttendanceRepo;
	const { items, total } = yield* attendanceRepo.listOvertimeRequests(input);
	return {
		items: items.map(toOvertimeRequestDto),
		total,
		page: input.page,
		pageSize: input.pageSize,
	};
});
