import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import {
	MAIL_TEMPLATE,
	mailSendSafe,
	overtimeStatusMailBuild,
} from "@app/mail";
import { ATTENDANCE_MESSAGE } from "@app/messages";
import {
	OVERTIME_STATUS,
	type TOvertimeRejectInput,
	type TOvertimeRequest,
} from "@app/schemas";
import { Effect } from "effect";
import { toOvertimeRequestDto } from "#/attendance/application/to-attendance-dto.ts";
import {
	AttendanceRepo,
	type TAttendanceRepoId,
} from "#/attendance/domain/attendance.ts";
import { EmployeeRepo, type TEmployeeRepoId } from "#/employee/index.ts";
import { MailService, type TMailServiceId } from "#/platform/mail/mailer.ts";
import { logger } from "#/platform/observability/logger.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import { EConflict, type EDatabase, ENotFound } from "#/shared/errors.ts";

export const overtimeReject = Effect.fn("overtimeReject")(function* (
	input: TOvertimeRejectInput,
	actorId: string,
): Effect.fn.Return<
	TOvertimeRequest,
	ENotFound | EConflict | EDatabase,
	TAttendanceRepoId | TActivityRecorderId | TEmployeeRepoId | TMailServiceId
> {
	const attendanceRepo = yield* AttendanceRepo;
	const activityRepo = yield* ActivityRecorder;
	const employeeRepo = yield* EmployeeRepo;
	const { mailer } = yield* MailService;

	const request = yield* attendanceRepo.findOvertimeById(input.id);
	if (request === null) {
		return yield* new ENotFound({
			message: ATTENDANCE_MESSAGE.OVERTIME_NOT_FOUND,
		});
	}
	if (request.status !== OVERTIME_STATUS.PENDING) {
		return yield* new EConflict({
			message: ATTENDANCE_MESSAGE.OVERTIME_ALREADY_PROCESSED,
		});
	}

	const updated = yield* attendanceRepo.updateOvertimeRequest(input.id, {
		status: OVERTIME_STATUS.REJECTED,
		rejectionReason: input.rejectionReason,
		approverId: actorId,
		approvedAt: new Date(),
	});
	if (updated === null) {
		return yield* new ENotFound({
			message: ATTENDANCE_MESSAGE.OVERTIME_NOT_FOUND,
		});
	}

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.OVERTIME_REJECT,
		resourceType: ACTIVITY_RESOURCE_TYPE.OVERTIME,
		resourceId: input.id,
		metadata: { rejectionReason: input.rejectionReason },
	});

	const employee = yield* employeeRepo.findById(request.employeeId);
	if (employee !== null) {
		yield* Effect.promise(() =>
			mailSendSafe(
				mailer,
				logger,
				MAIL_TEMPLATE.OVERTIME_STATUS,
				overtimeStatusMailBuild({
					to: employee.email,
					name: employee.fullName,
					approved: false,
					overtimeDate: request.overtimeDate,
					durationMinutes: request.durationMinutes,
					note: input.rejectionReason,
				}),
			),
		);
	}

	return toOvertimeRequestDto(updated);
});
