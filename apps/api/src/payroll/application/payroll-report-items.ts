import type { TPayrollItem } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { Effect } from "effect";
import { toPayrollItemDto } from "#/payroll/application/to-payroll-dto.ts";
import { PayrollRepo, type TPayrollRepoId } from "#/payroll/domain/payroll.ts";
import type { EDatabase } from "#/shared/errors.ts";

export const payrollReportItems = Effect.fn("payrollReportItems")(function* (
	periodId: string,
): Effect.fn.Return<TPayrollItem[], EDatabase, TPayrollRepoId> {
	const payrollRepo = yield* PayrollRepo;
	const rows = yield* payrollRepo.listAllItems(periodId);
	return [...A.map(rows, toPayrollItemDto)];
});
