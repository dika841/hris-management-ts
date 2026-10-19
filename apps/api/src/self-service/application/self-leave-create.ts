import type { TSelfLeaveCreateInput } from "@app/schemas";
import { Effect } from "effect";
import { leaveRequestCreate } from "#/attendance/index.ts";
import { resolveSelfEmployee } from "./resolve-self-employee.ts";

export const selfLeaveCreate = (userId: string, input: TSelfLeaveCreateInput) =>
	Effect.gen(function* () {
		const employee = yield* resolveSelfEmployee(userId);
		return yield* leaveRequestCreate(
			{ ...input, employeeId: employee.id },
			userId,
		);
	});
