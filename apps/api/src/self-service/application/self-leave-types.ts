import { A } from "@mobily/ts-belt";
import { Effect } from "effect";
import { AttendanceRepo, toLeaveTypeDto } from "#/attendance/index.ts";
import { resolveSelfEmployee } from "./resolve-self-employee.ts";

export const selfLeaveTypes = Effect.fn("selfLeaveTypes")(function* (
	userId: string,
) {
	yield* resolveSelfEmployee(userId);
	const attendanceRepo = yield* AttendanceRepo;
	const rows = yield* attendanceRepo.listLeaveTypes();
	return [...A.map(rows, toLeaveTypeDto)];
});
