import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { ATTENDANCE_MESSAGE } from "@app/messages";
import {
	OVERTIME_STATUS,
	type TOvertimeCancelInput,
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

export const overtimeCancel = Effect.fn("overtimeCancel")(function* (
	input: TOvertimeCancelInput,
	actorId: string,
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

	if (
		request.status !== OVERTIME_STATUS.PENDING &&
		request.status !== OVERTIME_STATUS.APPROVED
	) {
		return yield* new EConflict({
			message: ATTENDANCE_MESSAGE.OVERTIME_ALREADY_PROCESSED,
		});
	}

	const updated = yield* attendanceRepo.updateOvertimeRequest(input.id, {
		status: OVERTIME_STATUS.CANCELLED,
	});
	if (updated === null) {
		return yield* new ENotFound({
			message: ATTENDANCE_MESSAGE.OVERTIME_NOT_FOUND,
		});
	}

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.OVERTIME_CANCEL,
		resourceType: ACTIVITY_RESOURCE_TYPE.OVERTIME,
		resourceId: input.id,
		metadata: { employeeId: request.employeeId },
	});

	return toOvertimeRequestDto(updated);
});
