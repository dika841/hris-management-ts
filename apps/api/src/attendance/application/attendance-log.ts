import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { EMPLOYEE_MESSAGE } from "@app/messages";
import type { TAttendanceLog, TAttendanceLogInput } from "@app/schemas";
import { Effect } from "effect";
import { toAttendanceLogDto } from "#/attendance/application/to-attendance-dto.ts";
import {
	AttendanceRepo,
	type TAttendanceRepoId,
} from "#/attendance/domain/attendance.ts";
import { EmployeeRepo, type TEmployeeRepoId } from "#/employee/index.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import { type EDatabase, ENotFound } from "#/shared/errors.ts";

export const attendanceLog = Effect.fn("attendanceLog")(function* (
	input: TAttendanceLogInput,
	actorId: string,
): Effect.fn.Return<
	TAttendanceLog,
	ENotFound | EDatabase,
	TAttendanceRepoId | TEmployeeRepoId | TActivityRecorderId
> {
	const attendanceRepo = yield* AttendanceRepo;
	const employeeRepo = yield* EmployeeRepo;
	const activityRepo = yield* ActivityRecorder;

	const employee = yield* employeeRepo.findById(input.employeeId);
	if (employee === null) {
		return yield* new ENotFound({ message: EMPLOYEE_MESSAGE.NOT_FOUND });
	}

	// Check if holiday
	const holiday = yield* attendanceRepo.findHolidayByDate(input.attendanceDate);

	// Calculate effective work and late minutes
	let effectiveWorkMinutes = 0;
	let lateMinutes = 0;
	const STANDARD_WORK_START = 8 * 60; // 08:00

	if (input.checkIn && input.checkOut) {
		const checkInTime = new Date(input.checkIn);
		const checkOutTime = new Date(input.checkOut);
		effectiveWorkMinutes = Math.max(
			0,
			Math.round((checkOutTime.getTime() - checkInTime.getTime()) / 60000),
		);

		const checkInMinutes =
			checkInTime.getHours() * 60 + checkInTime.getMinutes();
		lateMinutes = Math.max(0, checkInMinutes - STANDARD_WORK_START);
	}

	const row = yield* attendanceRepo.upsertAttendanceLog({
		employeeId: input.employeeId,
		attendanceDate: input.attendanceDate,
		checkIn: input.checkIn ? new Date(input.checkIn) : null,
		checkOut: input.checkOut ? new Date(input.checkOut) : null,
		status: holiday !== null ? "holiday" : (input.status ?? "present"),
		lateMinutes,
		earlyDepartureMinutes: 0,
		effectiveWorkMinutes,
		leaveRequestId: null,
		notes:
			input.notes ?? (holiday !== null ? `Hari libur: ${holiday.name}` : null),
		isHoliday: holiday !== null,
		holidayName: holiday?.name ?? null,
	});

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.ATTENDANCE_LOG,
		resourceType: ACTIVITY_RESOURCE_TYPE.ATTENDANCE,
		resourceId: row.id,
		metadata: {
			employeeId: input.employeeId,
			attendanceDate: input.attendanceDate,
			status: row.status,
		},
	});

	return toAttendanceLogDto(row);
});
