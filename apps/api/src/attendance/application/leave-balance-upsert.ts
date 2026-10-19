import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import type { TLeaveBalance, TLeaveBalanceUpsertInput } from "@app/schemas";
import { Effect } from "effect";
import { toLeaveBalanceDto } from "#/attendance/application/to-leave-dto.ts";
import {
	AttendanceRepo,
	type TAttendanceRepoId,
} from "#/attendance/domain/attendance.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import type { EDatabase } from "#/shared/errors.ts";

export const leaveBalanceUpsert = Effect.fn("leaveBalanceUpsert")(function* (
	input: TLeaveBalanceUpsertInput,
	actorId: string,
): Effect.fn.Return<
	TLeaveBalance,
	EDatabase,
	TAttendanceRepoId | TActivityRecorderId
> {
	const attendanceRepo = yield* AttendanceRepo;
	const activityRepo = yield* ActivityRecorder;

	const row = yield* attendanceRepo.upsertLeaveBalance(input);

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.LEAVE_BALANCE_UPDATE,
		resourceType: ACTIVITY_RESOURCE_TYPE.LEAVE_TYPE,
		resourceId: row.id,
		metadata: {
			employeeId: row.employeeId,
			year: row.year,
			allocatedDays: row.allocatedDays,
			carryOverDays: row.carryOverDays,
		},
	});

	return toLeaveBalanceDto(row);
});
