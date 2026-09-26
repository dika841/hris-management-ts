import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import type { TPayrollPeriod, TPayrollPeriodCreateInput } from "@app/schemas";
import { Effect } from "effect";
import { toPayrollPeriodDto } from "#/payroll/application/to-payroll-dto.ts";
import {
	PayrollRepo,
	type TPayrollRepoId,
} from "#/payroll/domain/payroll.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import type { EDatabase } from "#/shared/errors.ts";

export const payrollPeriodCreate = Effect.fn("payrollPeriodCreate")(function* (
	input: TPayrollPeriodCreateInput,
	actorId: string,
): Effect.fn.Return<
	TPayrollPeriod,
	EDatabase,
	TPayrollRepoId | TActivityRecorderId
> {
	const payrollRepo = yield* PayrollRepo;
	const activityRepo = yield* ActivityRecorder;

	const row = yield* payrollRepo.createPeriod(input);

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.PAYROLL_PERIOD_CREATE,
		resourceType: ACTIVITY_RESOURCE_TYPE.PAYROLL,
		resourceId: row.id,
		metadata: {
			name: row.name,
			month: row.month,
			year: row.year,
		},
	});

	return toPayrollPeriodDto(row);
});
