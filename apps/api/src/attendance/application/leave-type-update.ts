import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { ATTENDANCE_MESSAGE } from "@app/messages";
import type { TLeaveType, TLeaveTypeUpdateInput } from "@app/schemas";
import { Effect } from "effect";
import { toLeaveTypeDto } from "#/attendance/application/to-leave-dto.ts";
import {
	AttendanceRepo,
	type TAttendanceRepoId,
} from "#/attendance/domain/attendance.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import { type EDatabase, ENotFound } from "#/shared/errors.ts";

export const leaveTypeUpdate = Effect.fn("leaveTypeUpdate")(function* (
	input: TLeaveTypeUpdateInput,
	actorId: string,
): Effect.fn.Return<
	TLeaveType,
	ENotFound | EDatabase,
	TAttendanceRepoId | TActivityRecorderId
> {
	const attendanceRepo = yield* AttendanceRepo;
	const activityRepo = yield* ActivityRecorder;

	const { id, ...patch } = input;
	const row = yield* attendanceRepo.updateLeaveType(id, patch);
	if (row === null) {
		return yield* new ENotFound({
			message: ATTENDANCE_MESSAGE.LEAVE_TYPE_NOT_FOUND,
		});
	}

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.LEAVE_TYPE_UPDATE,
		resourceType: ACTIVITY_RESOURCE_TYPE.LEAVE_TYPE,
		resourceId: row.id,
		metadata: { code: row.code, name: row.name },
	});

	return toLeaveTypeDto(row);
});
