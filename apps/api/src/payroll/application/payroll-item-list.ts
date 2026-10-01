import type { TPayrollItemList, TPayrollItemListInput } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { Effect } from "effect";
import { toPayrollItemDto } from "#/payroll/application/to-payroll-dto.ts";
import { PayrollRepo, type TPayrollRepoId } from "#/payroll/domain/payroll.ts";
import type { EDatabase } from "#/shared/errors.ts";

export const payrollItemList = Effect.fn("payrollItemList")(function* (
	input: TPayrollItemListInput,
): Effect.fn.Return<TPayrollItemList, EDatabase, TPayrollRepoId> {
	const payrollRepo = yield* PayrollRepo;
	const { items, total } = yield* payrollRepo.listItems(input);

	return {
		items: A.map(items, toPayrollItemDto),
		total,
		page: input.page,
		pageSize: input.pageSize,
	};
});
