import { A } from "@mobily/ts-belt";
import { Effect } from "effect";
import { AttendanceRepo, toLeaveBalanceDto } from "#/attendance/index.ts";
import { resolveSelfEmployee } from "./resolve-self-employee.ts";

export const selfLeaveBalances = Effect.fn("selfLeaveBalances")(function* (
	userId: string,
	year: number,
) {
	const employee = yield* resolveSelfEmployee(userId);
	const attendanceRepo = yield* AttendanceRepo;
	const rows = yield* attendanceRepo.listLeaveBalances(employee.id, year);
	return [...A.map(rows, toLeaveBalanceDto)];
});
