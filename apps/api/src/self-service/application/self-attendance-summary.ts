import { Effect } from "effect";
import { attendanceSummary } from "#/attendance/index.ts";
import { resolveSelfEmployee } from "./resolve-self-employee.ts";

export const selfAttendanceSummary = Effect.fn("selfAttendanceSummary")(
	function* (userId: string, input: { month: number; year: number }) {
		const employee = yield* resolveSelfEmployee(userId);
		return yield* attendanceSummary({ employeeId: employee.id, ...input });
	},
);
