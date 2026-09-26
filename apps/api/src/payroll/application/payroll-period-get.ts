import { PAYROLL_MESSAGE } from "@app/messages";
import type { TPayrollPeriod } from "@app/schemas";
import { Effect } from "effect";
import { toPayrollPeriodDto } from "#/payroll/application/to-payroll-dto.ts";
import {
	PayrollRepo,
	type TPayrollRepoId,
} from "#/payroll/domain/payroll.ts";
import { type EDatabase, ENotFound } from "#/shared/errors.ts";

export const payrollPeriodGet = Effect.fn("payrollPeriodGet")(function* (
	id: string,
): Effect.fn.Return<TPayrollPeriod, ENotFound | EDatabase, TPayrollRepoId> {
	const payrollRepo = yield* PayrollRepo;
	const row = yield* payrollRepo.findPeriodById(id);

	if (row === null) {
		return yield* new ENotFound({ message: PAYROLL_MESSAGE.PERIOD_NOT_FOUND });
	}

	return toPayrollPeriodDto(row);
});
