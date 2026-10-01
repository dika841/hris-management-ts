import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { ATTENDANCE_MESSAGE } from "@app/messages";
import {
	LEAVE_CODE,
	LEAVE_REQUEST_STATUS,
	type TLeaveRequest,
	type TLeaveRequestApproveInput,
} from "@app/schemas";
import { Effect } from "effect";
import { toLeaveRequestDto } from "#/attendance/application/to-leave-dto.ts";
import {
	AttendanceRepo,
	type TAttendanceRepoId,
} from "#/attendance/domain/attendance.ts";
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
	TAttendanceRepoId | TActivityRecorderId
> {
	const attendanceRepo = yield* AttendanceRepo;
	const activityRepo = yield* ActivityRecorder;

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

	// Log attendance for the leave period
	const start = new Date(request.startDate);
	const end = new Date(request.endDate);
	const current = new Date(start);
	while (current <= end) {
		const dayOfWeek = current.getDay();
		if (dayOfWeek !== 0 && dayOfWeek !== 6) {
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

	return toLeaveRequestDto(updated, leaveType?.name);
});
