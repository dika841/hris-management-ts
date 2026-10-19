import type { TPayrollItem } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { Effect } from "effect";
import { toPayrollItemDto } from "#/payroll/application/to-payroll-dto.ts";
import { PayrollRepo, type TPayrollRepoId } from "#/payroll/domain/payroll.ts";
import type { EDatabase } from "#/shared/errors.ts";

export const payrollItemListByEmployee = Effect.fn("payrollItemListByEmployee")(
	function* (
		employeeId: string,
	): Effect.fn.Return<TPayrollItem[], EDatabase, TPayrollRepoId> {
		const payrollRepo = yield* PayrollRepo;
		const rows = yield* payrollRepo.listItemsByEmployee(employeeId);
		return [...A.map(rows, toPayrollItemDto)];
	},
);
