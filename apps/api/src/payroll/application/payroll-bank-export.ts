import type { TPayrollBankRow } from "@app/schemas";
import { Effect } from "effect";
import { PayrollRepo, type TPayrollRepoId } from "#/payroll/domain/payroll.ts";
import type { EDatabase } from "#/shared/errors.ts";

export const payrollBankExport = Effect.fn("payrollBankExport")(function* (
	periodId: string,
): Effect.fn.Return<TPayrollBankRow[], EDatabase, TPayrollRepoId> {
	const payrollRepo = yield* PayrollRepo;
	const rows = yield* payrollRepo.listBankRows(periodId);
	return [...rows];
});
