import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { EMPLOYEE_MESSAGE } from "@app/messages";
import {
	OVERTIME_STATUS,
	type TOvertimeCreateInput,
	type TOvertimeRequest,
} from "@app/schemas";
import { Effect } from "effect";
import { toOvertimeRequestDto } from "#/attendance/application/to-attendance-dto.ts";
import {
	AttendanceRepo,
	type TAttendanceRepoId,
} from "#/attendance/domain/attendance.ts";
import {
	calculateDurationMinutes,
	calculateHourlyRate,
	calculateOvertimePay,
	getWeekBounds,
} from "#/attendance/domain/overtime-calculator.ts";
import { EmployeeRepo, type TEmployeeRepoId } from "#/employee/index.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import { EBadRequest, type EDatabase, ENotFound } from "#/shared/errors.ts";

export const overtimeCreate = Effect.fn("overtimeCreate")(function* (
	input: TOvertimeCreateInput,
	actorId: string,
): Effect.fn.Return<
	TOvertimeRequest,
	ENotFound | EBadRequest | EDatabase,
	TAttendanceRepoId | TEmployeeRepoId | TActivityRecorderId
> {
	const attendanceRepo = yield* AttendanceRepo;
	const employeeRepo = yield* EmployeeRepo;
	const activityRepo = yield* ActivityRecorder;

	// Validate employee
	const employee = yield* employeeRepo.findById(input.employeeId);
	if (employee === null) {
		return yield* new ENotFound({ message: EMPLOYEE_MESSAGE.NOT_FOUND });
	}

	// Calculate duration
	const durationMinutes = calculateDurationMinutes(
		input.startTime,
		input.endTime,
	);
	if (durationMinutes <= 0) {
		return yield* new EBadRequest({
			message: "Waktu selesai lembur harus setelah waktu mulai.",
		});
	}

	// Calculate hourly rate (1/173 * monthly salary)
	const hourlyRate = calculateHourlyRate(employee.basicSalary);

	// Get weekly accumulated overtime minutes
	const { weekStart, weekEnd } = getWeekBounds(input.overtimeDate);
	const weeklyAccumulated = yield* attendanceRepo.getWeeklyOvertimeMinutes(
		input.employeeId,
		weekStart,
		weekEnd,
	);

	// Calculate pay with compliance checks (PP 35/2021)
	const calc = calculateOvertimePay(
		durationMinutes,
		hourlyRate,
		input.dayType,
		input.workScheduleType,
		weeklyAccumulated,
	);

	const row = yield* attendanceRepo.createOvertimeRequest({
		employeeId: input.employeeId,
		overtimeDate: input.overtimeDate,
		startTime: input.startTime,
		endTime: input.endTime,
		durationMinutes,
		dayType: input.dayType,
		workScheduleType: input.workScheduleType,
		reason: input.reason ?? null,
		taskDescription: input.taskDescription ?? null,
		status: OVERTIME_STATUS.PENDING,
		approverId: null,
		approvedAt: null,
		rejectionReason: null,
		calculatedAmount: calc.totalAmount,
		hourlyRate,
		isOverDailyLimit: calc.isOverDailyLimit,
		isOverWeeklyLimit: calc.isOverWeeklyLimit,
		weeklyAccumulatedMinutes: calc.weeklyAccumulatedMinutes,
		notes:
			calc.complianceWarnings.length > 0
				? calc.complianceWarnings.join("; ")
				: null,
	});

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.OVERTIME_CREATE,
		resourceType: ACTIVITY_RESOURCE_TYPE.OVERTIME,
		resourceId: row.id,
		metadata: {
			employeeId: input.employeeId,
			overtimeDate: input.overtimeDate,
			durationMinutes,
			calculatedAmount: calc.totalAmount,
			isOverDailyLimit: calc.isOverDailyLimit,
			isOverWeeklyLimit: calc.isOverWeeklyLimit,
		},
	});

	return toOvertimeRequestDto(row);
});
