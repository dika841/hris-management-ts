import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { ATTENDANCE_MESSAGE } from "@app/messages";
import type { TLeaveType, TLeaveTypeCreateInput } from "@app/schemas";
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
import { EConflict, type EDatabase } from "#/shared/errors.ts";

export const leaveTypeCreate = Effect.fn("leaveTypeCreate")(function* (
	input: TLeaveTypeCreateInput,
	actorId: string,
): Effect.fn.Return<
	TLeaveType,
	EConflict | EDatabase,
	TAttendanceRepoId | TActivityRecorderId
> {
	const attendanceRepo = yield* AttendanceRepo;
	const activityRepo = yield* ActivityRecorder;

	const existing = yield* attendanceRepo.findLeaveTypeByCode(input.code);
	if (existing !== null) {
		return yield* new EConflict({
			message: ATTENDANCE_MESSAGE.LEAVE_TYPE_CODE_TAKEN,
		});
	}

	const row = yield* attendanceRepo.createLeaveType({
		code: input.code,
		name: input.name,
		category: input.category,
		description: input.description ?? null,
		defaultDays: input.defaultDays ?? 0,
		requiresDoctorNote: input.requiresDoctorNote ?? false,
		requiresSpouseNote: input.requiresSpouseNote ?? false,
		genderRestriction: input.genderRestriction ?? null,
		salaryPercentage: input.salaryPercentage ?? 100,
		isActive: input.isActive ?? true,
		isSystem: false,
	});

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.LEAVE_TYPE_CREATE,
		resourceType: ACTIVITY_RESOURCE_TYPE.LEAVE_TYPE,
		resourceId: row.id,
		metadata: { code: input.code, name: input.name },
	});

	return toLeaveTypeDto(row);
});
