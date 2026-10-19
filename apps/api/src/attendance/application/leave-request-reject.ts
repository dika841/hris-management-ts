import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { leaveStatusMailBuild, MAIL_TEMPLATE, mailSendSafe } from "@app/mail";
import { ATTENDANCE_MESSAGE } from "@app/messages";
import {
	LEAVE_CODE,
	LEAVE_REQUEST_STATUS,
	NOTIFICATION_TYPE,
	type TLeaveRequest,
	type TLeaveRequestRejectInput,
} from "@app/schemas";
import { Effect } from "effect";
import { toLeaveRequestDto } from "#/attendance/application/to-leave-dto.ts";
import {
	AttendanceRepo,
	type TAttendanceRepoId,
} from "#/attendance/domain/attendance.ts";
import { EmployeeRepo, type TEmployeeRepoId } from "#/employee/index.ts";
import {
	notificationCreate,
	type TNotificationRepoId,
} from "#/notification/index.ts";
import { MailService, type TMailServiceId } from "#/platform/mail/mailer.ts";
import { logger } from "#/platform/observability/logger.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import { EConflict, type EDatabase, ENotFound } from "#/shared/errors.ts";

export const leaveRequestReject = Effect.fn("leaveRequestReject")(function* (
	input: TLeaveRequestRejectInput,
	actorId: string,
): Effect.fn.Return<
	TLeaveRequest,
	ENotFound | EConflict | EDatabase,
	| TAttendanceRepoId
	| TActivityRecorderId
	| TEmployeeRepoId
	| TMailServiceId
	| TNotificationRepoId
> {
	const attendanceRepo = yield* AttendanceRepo;
	const activityRepo = yield* ActivityRecorder;
	const employeeRepo = yield* EmployeeRepo;
	const { mailer } = yield* MailService;

	const request = yield* attendanceRepo.findLeaveRequestById(input.id);
	if (request === null) {
		return yield* new ENotFound({
			message: ATTENDANCE_MESSAGE.LEAVE_REQUEST_NOT_FOUND,
		});
	}
	if (request.status !== LEAVE_REQUEST_STATUS.PENDING) {
		return yield* new EConflict({
			message: ATTENDANCE_MESSAGE.LEAVE_REQUEST_ALREADY_PROCESSED,
		});
	}

	const updated = yield* attendanceRepo.updateLeaveRequest(input.id, {
		status: LEAVE_REQUEST_STATUS.REJECTED,
		rejectionReason: input.rejectionReason,
		approverId: actorId,
		approvedAt: new Date(),
	});
	if (updated === null) {
		return yield* new ENotFound({
			message: ATTENDANCE_MESSAGE.LEAVE_REQUEST_NOT_FOUND,
		});
	}

	// Release pending balance (annual leave)
	const leaveType = yield* attendanceRepo.findLeaveTypeById(
		request.leaveTypeId,
	);
	if (leaveType !== null && leaveType.code === LEAVE_CODE.ANNUAL) {
		const year = new Date(request.startDate).getFullYear();
		const balance = yield* attendanceRepo.findLeaveBalance(
			request.employeeId,
			request.leaveTypeId,
			year,
		);
		if (balance !== null) {
			yield* attendanceRepo.updateLeaveBalance(balance.id, {
				pendingDays: Math.max(0, balance.pendingDays - request.totalDays),
			});
		}
	}

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.LEAVE_REQUEST_REJECT,
		resourceType: ACTIVITY_RESOURCE_TYPE.LEAVE_REQUEST,
		resourceId: input.id,
		metadata: { rejectionReason: input.rejectionReason },
	});

	const employee = yield* employeeRepo.findById(request.employeeId);
	if (employee !== null && employee.userId !== null) {
		yield* notificationCreate({
			userId: employee.userId,
			type: NOTIFICATION_TYPE.LEAVE_STATUS,
			title: "Leave request rejected",
			body: `${leaveType?.name ?? "Leave"} ${request.startDate} - ${request.endDate}`,
			link: "/attendance",
		});
	}
	if (employee !== null) {
		yield* Effect.promise(() =>
			mailSendSafe(
				mailer,
				logger,
				MAIL_TEMPLATE.LEAVE_STATUS,
				leaveStatusMailBuild({
					to: employee.email,
					name: employee.fullName,
					approved: false,
					leaveTypeName: leaveType?.name ?? "Cuti",
					startDate: request.startDate,
					endDate: request.endDate,
					note: input.rejectionReason,
				}),
			),
		);
	}

	return toLeaveRequestDto(updated, leaveType?.name);
});
