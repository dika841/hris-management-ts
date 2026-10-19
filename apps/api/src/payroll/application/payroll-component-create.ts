import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { EMPLOYEE_MESSAGE, PAYROLL_MESSAGE } from "@app/messages";
import type {
	TPayrollComponent,
	TPayrollComponentCreateInput,
} from "@app/schemas";
import { Effect } from "effect";
import { toPayrollComponentDto } from "#/payroll/application/to-payroll-dto.ts";
import { PayrollRepo, type TPayrollRepoId } from "#/payroll/domain/payroll.ts";
import { EmployeeRepo, type TEmployeeRepoId } from "#/employee/index.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import { EConflict, type EDatabase, ENotFound } from "#/shared/errors.ts";

export const payrollComponentCreate = Effect.fn("payrollComponentCreate")(
	function* (
		input: TPayrollComponentCreateInput,
		actorId: string,
	): Effect.fn.Return<
		TPayrollComponent,
		ENotFound | EConflict | EDatabase,
		TPayrollRepoId | TEmployeeRepoId | TActivityRecorderId
	> {
		const payrollRepo = yield* PayrollRepo;
		const employeeRepo = yield* EmployeeRepo;
		const activityRepo = yield* ActivityRecorder;

		const period = yield* payrollRepo.findPeriodById(input.payrollPeriodId);
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

		const employee = yield* employeeRepo.findById(input.employeeId);
		if (employee === null) {
			return yield* new ENotFound({ message: EMPLOYEE_MESSAGE.NOT_FOUND });
		}

		const row = yield* payrollRepo.createComponent({
			payrollPeriodId: input.payrollPeriodId,
			employeeId: input.employeeId,
			type: input.type,
			amount: input.amount,
			notes: input.notes ?? null,
		});

		yield* activityRepo.insert({
			actorId,
			action: ACTIVITY_ACTION.PAYROLL_COMPONENT_CREATE,
			resourceType: ACTIVITY_RESOURCE_TYPE.PAYROLL,
			resourceId: row.id,
			metadata: {
				periodId: row.payrollPeriodId,
				employeeId: row.employeeId,
				type: row.type,
				amount: row.amount,
			},
		});

		return toPayrollComponentDto(row);
	},
);
