import type { TPayrollPeriodList, TPayrollPeriodListInput } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { Effect } from "effect";
import { toPayrollPeriodDto } from "#/payroll/application/to-payroll-dto.ts";
import { PayrollRepo, type TPayrollRepoId } from "#/payroll/domain/payroll.ts";
import type { EDatabase } from "#/shared/errors.ts";

export const payrollPeriodList = Effect.fn("payrollPeriodList")(function* (
	input: TPayrollPeriodListInput,
): Effect.fn.Return<TPayrollPeriodList, EDatabase, TPayrollRepoId> {
	const payrollRepo = yield* PayrollRepo;
	const { items, total } = yield* payrollRepo.listPeriods(input);

	return {
		items: A.map(items, toPayrollPeriodDto),
		total,
		page: input.page,
		pageSize: input.pageSize,
	};
});
