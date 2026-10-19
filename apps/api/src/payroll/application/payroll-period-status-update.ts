import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { PAYROLL_MESSAGE } from "@app/messages";
import {
	NOTIFICATION_TYPE,
	PAYROLL_PERIOD_STATUS,
	type TPayrollPeriod,
	type TPayrollPeriodStatus,
	type TPayrollPeriodStatusUpdateInput,
} from "@app/schemas";
import { Effect } from "effect";
import { EmployeeRepo, type TEmployeeRepoId } from "#/employee/index.ts";
import {
	notificationCreate,
	type TNotificationRepoId,
} from "#/notification/index.ts";
import { toPayrollPeriodDto } from "#/payroll/application/to-payroll-dto.ts";
import { PayrollRepo, type TPayrollRepoId } from "#/payroll/domain/payroll.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import { EConflict, type EDatabase, ENotFound } from "#/shared/errors.ts";

const ALLOWED_TRANSITIONS: Readonly<
	Record<TPayrollPeriodStatus, readonly TPayrollPeriodStatus[]>
> = {
	[PAYROLL_PERIOD_STATUS.DRAFT]: [PAYROLL_PERIOD_STATUS.APPROVED],
	[PAYROLL_PERIOD_STATUS.CALCULATING]: [PAYROLL_PERIOD_STATUS.APPROVED],
	[PAYROLL_PERIOD_STATUS.APPROVED]: [PAYROLL_PERIOD_STATUS.PAID],
	[PAYROLL_PERIOD_STATUS.PAID]: [PAYROLL_PERIOD_STATUS.LOCKED],
	[PAYROLL_PERIOD_STATUS.LOCKED]: [],
};

const actionFor = (status: TPayrollPeriodStatus) => {
	if (status === PAYROLL_PERIOD_STATUS.APPROVED) {
		return ACTIVITY_ACTION.PAYROLL_APPROVE;
	}
	if (status === PAYROLL_PERIOD_STATUS.PAID) {
		return ACTIVITY_ACTION.PAYROLL_PAY;
	}
	return ACTIVITY_ACTION.PAYROLL_LOCK;
};

export const payrollPeriodStatusUpdate = Effect.fn("payrollPeriodStatusUpdate")(
	function* (
		input: TPayrollPeriodStatusUpdateInput,
		actorId: string,
	): Effect.fn.Return<
		TPayrollPeriod,
		ENotFound | EConflict | EDatabase,
		TPayrollRepoId | TActivityRecorderId | TEmployeeRepoId | TNotificationRepoId
	> {
		const payrollRepo = yield* PayrollRepo;
		const activityRepo = yield* ActivityRecorder;
		const employeeRepo = yield* EmployeeRepo;

		const period = yield* payrollRepo.findPeriodById(input.id);
		if (period === null) {
			return yield* new ENotFound({
				message: PAYROLL_MESSAGE.PERIOD_NOT_FOUND,
			});
		}

		const allowed = ALLOWED_TRANSITIONS[period.status] ?? [];
		if (!allowed.includes(input.status)) {
			return yield* new EConflict({
				message: PAYROLL_MESSAGE.PERIOD_STATUS_INVALID,
			});
		}

		if (
			input.status === PAYROLL_PERIOD_STATUS.APPROVED &&
			period.totalEmployees === 0
		) {
			return yield* new EConflict({
				message: PAYROLL_MESSAGE.PERIOD_HAS_NO_ITEMS,
			});
		}

		const updated = yield* payrollRepo.updatePeriod({
			id: input.id,
			status: input.status,
		});
		if (updated === null) {
			return yield* new ENotFound({
				message: PAYROLL_MESSAGE.PERIOD_NOT_FOUND,
			});
		}

		yield* activityRepo.insert({
			actorId,
			action: actionFor(input.status),
			resourceType: ACTIVITY_RESOURCE_TYPE.PAYROLL,
			resourceId: updated.id,
			metadata: {
				periodName: updated.name,
				previousStatus: period.status,
				newStatus: updated.status,
			},
		});

		if (input.status === PAYROLL_PERIOD_STATUS.PAID) {
			const items = yield* payrollRepo.listAllItems(updated.id);
			for (const item of items) {
				const employee = yield* employeeRepo.findById(item.employeeId);
				if (employee?.userId) {
					yield* notificationCreate({
						userId: employee.userId,
						type: NOTIFICATION_TYPE.PAYROLL_PAID,
						title: "Payroll paid",
						body: `${updated.name} · Net pay Rp ${item.netPay.toLocaleString("id-ID")}`,
						link: `/payroll/${updated.id}/payslip/${item.id}`,
					});
				}
			}
		}

		return toPayrollPeriodDto(updated);
	},
);
