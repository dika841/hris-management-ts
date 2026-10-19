import { PAYROLL_MESSAGE } from "@app/messages";
import { Effect } from "effect";
import { payrollPayslipGet } from "#/payroll/index.ts";
import { ENotFound } from "#/shared/errors.ts";
import { resolveSelfEmployee } from "./resolve-self-employee.ts";

export const selfPayslipGet = (userId: string, itemId: string) =>
	Effect.gen(function* () {
		const employee = yield* resolveSelfEmployee(userId);
		const payslip = yield* payrollPayslipGet(itemId, userId);
		if (payslip.item.employeeId !== employee.id) {
			return yield* new ENotFound({ message: PAYROLL_MESSAGE.ITEM_NOT_FOUND });
		}
		return payslip;
	});
