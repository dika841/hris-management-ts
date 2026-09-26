import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import type {
	TPayrollCalculateInput,
	TPayrollPeriod,
} from "@app/schemas";
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

export const payrollCalculatePeriod = Effect.fn("payrollCalculatePeriod")(
	function* (
		input: TPayrollCalculateInput,
		actorId: string,
	): Effect.fn.Return<
		TPayrollPeriod,
		EDatabase,
		TPayrollRepoId | TActivityRecorderId
	> {
		const payrollRepo = yield* PayrollRepo;
		const activityRepo = yield* ActivityRecorder;

		const { period, processed } = yield* payrollRepo.calculatePeriod(input);

		yield* activityRepo.insert({
			actorId,
			action: ACTIVITY_ACTION.PAYROLL_CALCULATE,
			resourceType: ACTIVITY_RESOURCE_TYPE.PAYROLL,
			resourceId: period.id,
			metadata: {
				periodName: period.name,
				employeesProcessed: processed,
				totalGross: period.totalGross,
				totalPph21: period.totalPph21,
				totalNetPay: period.totalNetPay,
			},
		});

		return toPayrollPeriodDto(period);
	},
);
