import { PAYROLL_MESSAGE } from "@app/messages";
import type { TPayrollItem } from "@app/schemas";
import { Effect } from "effect";
import { toPayrollItemDto } from "#/payroll/application/to-payroll-dto.ts";
import { PayrollRepo, type TPayrollRepoId } from "#/payroll/domain/payroll.ts";
import { type EDatabase, ENotFound } from "#/shared/errors.ts";

export const payrollItemGet = Effect.fn("payrollItemGet")(function* (
	id: string,
): Effect.fn.Return<TPayrollItem, ENotFound | EDatabase, TPayrollRepoId> {
	const payrollRepo = yield* PayrollRepo;
	const row = yield* payrollRepo.findItemById(id);
	if (row === null) {
		return yield* new ENotFound({ message: PAYROLL_MESSAGE.ITEM_NOT_FOUND });
	}
	return toPayrollItemDto(row);
});
