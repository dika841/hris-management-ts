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

const JAKARTA_TIME_ZONE = "Asia/Jakarta";

const timeToMinutes = (value: string): number => {
	const [hour, minute] = value.split(":").map(Number);
	return (hour ?? 0) * 60 + (minute ?? 0);
};

const minutesInJakarta = (value: Date): number => {
	const formatter = new Intl.DateTimeFormat("en-GB", {
		timeZone: JAKARTA_TIME_ZONE,
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
	const parts = formatter.formatToParts(value);
	const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
	const minute = Number(
		parts.find((part) => part.type === "minute")?.value ?? "0",
	);
	return hour * 60 + minute;
};

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

	// Calculate effective work, late, and early-departure minutes in WIB
	// against the employee's configured work schedule.
	let effectiveWorkMinutes = 0;
	let lateMinutes = 0;
	let earlyDepartureMinutes = 0;
	const workStartMinutes = timeToMinutes(employee.workStartTime);
	const workEndMinutes = timeToMinutes(employee.workEndTime);

	if (input.checkIn && input.checkOut) {
		const checkInTime = new Date(input.checkIn);
		const checkOutTime = new Date(input.checkOut);
		effectiveWorkMinutes = Math.max(
			0,
			Math.round((checkOutTime.getTime() - checkInTime.getTime()) / 60000),
		);

		lateMinutes = Math.max(0, minutesInJakarta(checkInTime) - workStartMinutes);
		earlyDepartureMinutes = Math.max(
			0,
			workEndMinutes - minutesInJakarta(checkOutTime),
		);
	}

	const row = yield* attendanceRepo.upsertAttendanceLog({
		employeeId: input.employeeId,
		attendanceDate: input.attendanceDate,
		checkIn: input.checkIn ? new Date(input.checkIn) : null,
		checkOut: input.checkOut ? new Date(input.checkOut) : null,
		status: holiday !== null ? "holiday" : (input.status ?? "present"),
		lateMinutes,
		earlyDepartureMinutes,
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
