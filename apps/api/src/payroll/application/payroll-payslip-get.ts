import { PAYROLL_MESSAGE } from "@app/messages";
import type { TPayrollPayslip } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { Effect } from "effect";
import {
	toPayrollComponentDto,
	toPayrollItemDto,
	toPayrollPeriodDto,
} from "#/payroll/application/to-payroll-dto.ts";
import { PayrollRepo, type TPayrollRepoId } from "#/payroll/domain/payroll.ts";
import { type EDatabase, ENotFound } from "#/shared/errors.ts";

export const payrollPayslipGet = Effect.fn("payrollPayslipGet")(function* (
	itemId: string,
): Effect.fn.Return<TPayrollPayslip, ENotFound | EDatabase, TPayrollRepoId> {
	const payrollRepo = yield* PayrollRepo;
	const item = yield* payrollRepo.findItemById(itemId);
	if (item === null) {
		return yield* new ENotFound({ message: PAYROLL_MESSAGE.ITEM_NOT_FOUND });
	}
	const period = yield* payrollRepo.findPeriodById(item.payrollPeriodId);
	if (period === null) {
		return yield* new ENotFound({ message: PAYROLL_MESSAGE.PERIOD_NOT_FOUND });
	}
	const components = yield* payrollRepo.listItemComponents(
		item.payrollPeriodId,
		item.employeeId,
	);

	return {
		period: toPayrollPeriodDto(period),
		item: toPayrollItemDto(item),
		components: [...A.map(components, toPayrollComponentDto)],
	};
});
