import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { ATTENDANCE_MESSAGE } from "@app/messages";
import {
	OVERTIME_STATUS,
	type TOvertimeApproveInput,
	type TOvertimeRequest,
} from "@app/schemas";
import { Effect } from "effect";
import { toOvertimeRequestDto } from "#/attendance/application/to-attendance-dto.ts";
import {
	AttendanceRepo,
	type TAttendanceRepoId,
} from "#/attendance/domain/attendance.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import { EConflict, type EDatabase, ENotFound } from "#/shared/errors.ts";

export const overtimeApprove = Effect.fn("overtimeApprove")(function* (
	input: TOvertimeApproveInput,
	approverId: string,
): Effect.fn.Return<
	TOvertimeRequest,
	ENotFound | EConflict | EDatabase,
	TAttendanceRepoId | TActivityRecorderId
> {
	const attendanceRepo = yield* AttendanceRepo;
	const activityRepo = yield* ActivityRecorder;

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
		status: OVERTIME_STATUS.APPROVED,
		approverId,
		approvedAt: new Date(),
		notes: input.notes ?? null,
	});
	if (updated === null) {
		return yield* new ENotFound({
			message: ATTENDANCE_MESSAGE.OVERTIME_NOT_FOUND,
		});
	}

	yield* activityRepo.insert({
		actorId: approverId,
		action: ACTIVITY_ACTION.OVERTIME_APPROVE,
		resourceType: ACTIVITY_RESOURCE_TYPE.OVERTIME,
		resourceId: input.id,
		metadata: {
			employeeId: request.employeeId,
			overtimeDate: request.overtimeDate,
			calculatedAmount: request.calculatedAmount,
		},
	});

	return toOvertimeRequestDto(updated);
});
