import type { TAttendanceListInput } from "@app/schemas";
import { Effect } from "effect";
import { attendanceList } from "#/attendance/index.ts";
import { resolveSelfEmployee } from "./resolve-self-employee.ts";

export const selfAttendanceList = Effect.fn("selfAttendanceList")(function* (
	userId: string,
	input: Omit<TAttendanceListInput, "employeeId">,
) {
	const employee = yield* resolveSelfEmployee(userId);
	return yield* attendanceList({ ...input, employeeId: employee.id });
});
