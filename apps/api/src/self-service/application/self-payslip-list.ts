import { Effect } from "effect";
import { payrollItemListByEmployee } from "#/payroll/index.ts";
import { resolveSelfEmployee } from "./resolve-self-employee.ts";

export const selfPayslipList = Effect.fn("selfPayslipList")(function* (
	userId: string,
) {
	const employee = yield* resolveSelfEmployee(userId);
	return yield* payrollItemListByEmployee(employee.id);
});
