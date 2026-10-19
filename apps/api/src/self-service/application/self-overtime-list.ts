import type { TOvertimeListInput } from "@app/schemas";
import { Effect } from "effect";
import { overtimeList } from "#/attendance/index.ts";
import { resolveSelfEmployee } from "./resolve-self-employee.ts";

export const selfOvertimeList = Effect.fn("selfOvertimeList")(function* (
	userId: string,
	input: Omit<TOvertimeListInput, "employeeId">,
) {
	const employee = yield* resolveSelfEmployee(userId);
	return yield* overtimeList({ ...input, employeeId: employee.id });
});
