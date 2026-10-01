import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { ATTENDANCE_MESSAGE } from "@app/messages";
import {
	LEAVE_CODE,
	LEAVE_REQUEST_STATUS,
	type TLeaveRequest,
	type TLeaveRequestRejectInput,
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

export const leaveRequestReject = Effect.fn("leaveRequestReject")(function* (
	input: TLeaveRequestRejectInput,
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

	return toLeaveRequestDto(updated, leaveType?.name);
});
