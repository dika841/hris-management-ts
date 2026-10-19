import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { PAYROLL_MESSAGE } from "@app/messages";
import type { TPayrollComponentDeleteInput } from "@app/schemas";
import { Effect } from "effect";
import { PayrollRepo, type TPayrollRepoId } from "#/payroll/domain/payroll.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import { EConflict, type EDatabase, ENotFound } from "#/shared/errors.ts";

export const payrollComponentDelete = Effect.fn("payrollComponentDelete")(
	function* (
		input: TPayrollComponentDeleteInput,
		actorId: string,
	): Effect.fn.Return<
		{ id: string },
		ENotFound | EConflict | EDatabase,
		TPayrollRepoId | TActivityRecorderId
	> {
		const payrollRepo = yield* PayrollRepo;
		const activityRepo = yield* ActivityRecorder;

		const component = yield* payrollRepo.findComponentById(input.id);
		if (component === null) {
			return yield* new ENotFound({ message: PAYROLL_MESSAGE.ITEM_NOT_FOUND });
		}

		const period = yield* payrollRepo.findPeriodById(component.payrollPeriodId);
		if (period === null) {
			return yield* new ENotFound({
				message: PAYROLL_MESSAGE.PERIOD_NOT_FOUND,
			});
		}
		if (period.status !== "draft" && period.status !== "calculating") {
			return yield* new EConflict({
				message: PAYROLL_MESSAGE.PERIOD_NOT_EDITABLE,
			});
		}

		const removed = yield* payrollRepo.removeComponent(input.id);
		if (!removed) {
			return yield* new ENotFound({ message: PAYROLL_MESSAGE.ITEM_NOT_FOUND });
		}

		yield* activityRepo.insert({
			actorId,
			action: ACTIVITY_ACTION.PAYROLL_COMPONENT_DELETE,
			resourceType: ACTIVITY_RESOURCE_TYPE.PAYROLL,
			resourceId: input.id,
			metadata: { periodId: component.payrollPeriodId },
		});

		return { id: input.id };
	},
);
