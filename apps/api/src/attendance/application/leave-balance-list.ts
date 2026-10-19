import type { TLeaveBalance, TLeaveBalanceListInput } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { Effect } from "effect";
import { toLeaveBalanceDto } from "#/attendance/application/to-leave-dto.ts";
import {
	AttendanceRepo,
	type TAttendanceRepoId,
} from "#/attendance/domain/attendance.ts";
import type { EDatabase } from "#/shared/errors.ts";

export const leaveBalanceList = Effect.fn("leaveBalanceList")(function* (
	input: TLeaveBalanceListInput,
): Effect.fn.Return<TLeaveBalance[], EDatabase, TAttendanceRepoId> {
	const attendanceRepo = yield* AttendanceRepo;
	const rows = yield* attendanceRepo.listLeaveBalances(
		input.employeeId,
		input.year,
	);
	return [...A.map(rows, toLeaveBalanceDto)];
});
