import type { TPayrollComponent } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { Effect } from "effect";
import { toPayrollComponentDto } from "#/payroll/application/to-payroll-dto.ts";
import { PayrollRepo, type TPayrollRepoId } from "#/payroll/domain/payroll.ts";
import type { EDatabase } from "#/shared/errors.ts";

export const payrollComponentList = Effect.fn("payrollComponentList")(
	function* (
		periodId: string,
	): Effect.fn.Return<TPayrollComponent[], EDatabase, TPayrollRepoId> {
		const payrollRepo = yield* PayrollRepo;
		const rows = yield* payrollRepo.listComponents(periodId);
		return [...A.map(rows, toPayrollComponentDto)];
	},
);
