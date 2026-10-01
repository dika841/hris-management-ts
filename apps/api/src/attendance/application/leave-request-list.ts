import type { TLeaveRequestList, TLeaveRequestListInput } from "@app/schemas";
import { Effect } from "effect";
import { toLeaveRequestDto } from "#/attendance/application/to-leave-dto.ts";
import {
	AttendanceRepo,
	type TAttendanceRepoId,
} from "#/attendance/domain/attendance.ts";
import type { EDatabase } from "#/shared/errors.ts";

export const leaveRequestList = Effect.fn("leaveRequestList")(function* (
	input: TLeaveRequestListInput,
): Effect.fn.Return<TLeaveRequestList, EDatabase, TAttendanceRepoId> {
	const attendanceRepo = yield* AttendanceRepo;
	const { items, total } = yield* attendanceRepo.listLeaveRequests(input);
	return {
		items: items.map((r) => toLeaveRequestDto(r)),
		total,
		page: input.page,
		pageSize: input.pageSize,
	};
});
