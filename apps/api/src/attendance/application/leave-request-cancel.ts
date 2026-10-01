import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { ATTENDANCE_MESSAGE } from "@app/messages";
import {
	LEAVE_CODE,
	LEAVE_REQUEST_STATUS,
	type TLeaveRequest,
	type TLeaveRequestCancelInput,
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
import { EConflict, type EDatabase, ENotFound } from "#/shared/errors.ts";

export const leaveRequestCancel = Effect.fn("leaveRequestCancel")(function* (
	input: TLeaveRequestCancelInput,
	actorId: string,
): Effect.fn.Return<
	TLeaveRequest,
	ENotFound | EConflict | EDatabase,
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
	if (
		request.status !== LEAVE_REQUEST_STATUS.PENDING &&
		request.status !== LEAVE_REQUEST_STATUS.APPROVED
	) {
		return yield* new EConflict({
			message: ATTENDANCE_MESSAGE.LEAVE_REQUEST_ALREADY_PROCESSED,
		});
	}

	const updated = yield* attendanceRepo.updateLeaveRequest(input.id, {
		status: LEAVE_REQUEST_STATUS.CANCELLED,
	});
	if (updated === null) {
		return yield* new ENotFound({
			message: ATTENDANCE_MESSAGE.LEAVE_REQUEST_NOT_FOUND,
		});
	}

	// Restore balance
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
			if (request.status === LEAVE_REQUEST_STATUS.PENDING) {
				yield* attendanceRepo.updateLeaveBalance(balance.id, {
					pendingDays: Math.max(0, balance.pendingDays - request.totalDays),
				});
			} else if (request.status === LEAVE_REQUEST_STATUS.APPROVED) {
				yield* attendanceRepo.updateLeaveBalance(balance.id, {
					usedDays: Math.max(0, balance.usedDays - request.totalDays),
				});
			}
		}
	}

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.LEAVE_REQUEST_CANCEL,
		resourceType: ACTIVITY_RESOURCE_TYPE.LEAVE_REQUEST,
		resourceId: input.id,
		metadata: { employeeId: request.employeeId },
	});

	return toLeaveRequestDto(updated, leaveType?.name);
});
