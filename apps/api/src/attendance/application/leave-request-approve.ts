import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { leaveStatusMailBuild, MAIL_TEMPLATE, mailSendSafe } from "@app/mail";
import { ATTENDANCE_MESSAGE } from "@app/messages";
import {
	LEAVE_CODE,
	LEAVE_REQUEST_STATUS,
	NOTIFICATION_TYPE,
	WORK_SCHEDULE_TYPE,
	type TLeaveRequest,
	type TLeaveRequestApproveInput,
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
import {
	type EBadRequest,
	EConflict,
	type EDatabase,
	ENotFound,
} from "#/shared/errors.ts";

export const leaveRequestApprove = Effect.fn("leaveRequestApprove")(function* (
	input: TLeaveRequestApproveInput,
	approverId: string,
): Effect.fn.Return<
	TLeaveRequest,
	ENotFound | EConflict | EBadRequest | EDatabase,
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

	// Approve the request
	const updated = yield* attendanceRepo.updateLeaveRequest(input.id, {
		status: LEAVE_REQUEST_STATUS.APPROVED,
		approverId,
		approvedAt: new Date(),
		notes: input.notes ?? null,
	});

	if (updated === null) {
		return yield* new ENotFound({
			message: ATTENDANCE_MESSAGE.LEAVE_REQUEST_NOT_FOUND,
		});
	}

	// Update leave balance: move from pending → used
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
				usedDays: balance.usedDays + request.totalDays,
			});
		}
	}

	const employee = yield* employeeRepo.findById(request.employeeId);

	// Log attendance for the leave period
	const start = new Date(request.startDate);
	const end = new Date(request.endDate);
	const current = new Date(start);
	while (current <= end) {
		const dayOfWeek = current.getDay();
		const isWorkday =
			dayOfWeek !== 0 &&
			(dayOfWeek !== 6 ||
				employee?.workScheduleType === WORK_SCHEDULE_TYPE.SIX_DAYS);
		if (isWorkday) {
			const dateStr = current.toISOString().split("T")[0] ?? "";
			yield* attendanceRepo.upsertAttendanceLog({
				employeeId: request.employeeId,
				attendanceDate: dateStr,
				checkIn: null,
				checkOut: null,
				status: "leave",
				lateMinutes: 0,
				earlyDepartureMinutes: 0,
				effectiveWorkMinutes: 0,
				leaveRequestId: request.id,
				notes: `Cuti disetujui`,
				isHoliday: false,
				holidayName: null,
			});
		}
		current.setDate(current.getDate() + 1);
	}

	yield* activityRepo.insert({
		actorId: approverId,
		action: ACTIVITY_ACTION.LEAVE_REQUEST_APPROVE,
		resourceType: ACTIVITY_RESOURCE_TYPE.LEAVE_REQUEST,
		resourceId: input.id,
		metadata: {
			employeeId: request.employeeId,
			startDate: request.startDate,
			endDate: request.endDate,
			totalDays: request.totalDays,
		},
	});

	if (employee !== null && employee.userId !== null) {
		yield* notificationCreate({
			userId: employee.userId,
			type: NOTIFICATION_TYPE.LEAVE_STATUS,
			title: "Leave request approved",
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
					approved: true,
					leaveTypeName: leaveType?.name ?? "Cuti",
					startDate: request.startDate,
					endDate: request.endDate,
					note: input.notes,
				}),
			),
		);
	}

	return toLeaveRequestDto(updated, leaveType?.name);
});
