import type { TLeaveRequestListInput } from "@app/schemas";
import { Effect } from "effect";
import { leaveRequestList } from "#/attendance/index.ts";
import { resolveSelfEmployee } from "./resolve-self-employee.ts";

export const selfLeaveList = Effect.fn("selfLeaveList")(function* (
	userId: string,
	input: Omit<TLeaveRequestListInput, "employeeId">,
) {
	const employee = yield* resolveSelfEmployee(userId);
	return yield* leaveRequestList({ ...input, employeeId: employee.id });
});
