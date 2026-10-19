import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { MAIL_TEMPLATE, mailSendSafe, payslipMailBuild } from "@app/mail";
import { PAYROLL_MESSAGE } from "@app/messages";
import { Effect } from "effect";
import { EmployeeRepo, type TEmployeeRepoId } from "#/employee/index.ts";
import { PayrollRepo, type TPayrollRepoId } from "#/payroll/domain/payroll.ts";
import { env } from "#/platform/config/env.ts";
import { MailService, type TMailServiceId } from "#/platform/mail/mailer.ts";
import { logger } from "#/platform/observability/logger.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import { ENotFound, type EDatabase } from "#/shared/errors.ts";

export const payrollPayslipSend = Effect.fn("payrollPayslipSend")(function* (
	itemId: string,
	actorId: string,
): Effect.fn.Return<
	{ sent: boolean },
	ENotFound | EDatabase,
	TPayrollRepoId | TEmployeeRepoId | TMailServiceId | TActivityRecorderId
> {
	const payrollRepo = yield* PayrollRepo;
	const employeeRepo = yield* EmployeeRepo;
	const { mailer } = yield* MailService;
	const activityRepo = yield* ActivityRecorder;

	const item = yield* payrollRepo.findItemById(itemId);
	if (item === null) {
		return yield* new ENotFound({ message: PAYROLL_MESSAGE.ITEM_NOT_FOUND });
	}
	const period = yield* payrollRepo.findPeriodById(item.payrollPeriodId);
	if (period === null) {
		return yield* new ENotFound({ message: PAYROLL_MESSAGE.PERIOD_NOT_FOUND });
	}
	const employee = yield* employeeRepo.findById(item.employeeId);
	if (employee === null) {
		return yield* new ENotFound({ message: PAYROLL_MESSAGE.ITEM_NOT_FOUND });
	}

	const url = `${env.WEB_ORIGIN}/payroll/${period.id}/payslip/${item.id}`;
	const sent = yield* Effect.promise(() =>
		mailSendSafe(
			mailer,
			logger,
			MAIL_TEMPLATE.PAYSLIP,
			payslipMailBuild({
				to: employee.email,
				name: employee.fullName,
				periodName: period.name,
				url,
			}),
		),
	);

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.PAYROLL_PAYSLIP_SEND,
		resourceType: ACTIVITY_RESOURCE_TYPE.PAYROLL,
		resourceId: item.id,
		metadata: { employeeId: item.employeeId, periodId: period.id, sent },
	});

	return { sent };
});
