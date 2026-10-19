import type { TSelfOvertimeCreateInput } from "@app/schemas";
import { Effect } from "effect";
import { overtimeCreate } from "#/attendance/index.ts";
import { resolveSelfEmployee } from "./resolve-self-employee.ts";

export const selfOvertimeCreate = (
	userId: string,
	input: TSelfOvertimeCreateInput,
) =>
	Effect.gen(function* () {
		const employee = yield* resolveSelfEmployee(userId);
		return yield* overtimeCreate({ ...input, employeeId: employee.id }, userId);
	});
