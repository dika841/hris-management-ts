import type { TLeaveType } from "@app/schemas";
import { Effect } from "effect";
import { toLeaveTypeDto } from "#/attendance/application/to-leave-dto.ts";
import {
	AttendanceRepo,
	type TAttendanceRepoId,
} from "#/attendance/domain/attendance.ts";
import type { EDatabase } from "#/shared/errors.ts";

export const leaveTypeList = Effect.fn("leaveTypeList")(
	function* (): Effect.fn.Return<
		readonly TLeaveType[],
		EDatabase,
		TAttendanceRepoId
	> {
		const attendanceRepo = yield* AttendanceRepo;
		const rows = yield* attendanceRepo.listLeaveTypes();
		return rows.map(toLeaveTypeDto);
	},
);
