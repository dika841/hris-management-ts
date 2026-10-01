import { EMPLOYEE_MESSAGE } from "@app/messages";
import {
	type TOvertimeCalculation,
	overtimeCalculationSchema,
	type TOvertimeCreateInput,
} from "@app/schemas";
import { Effect } from "effect";
import {
	calculateDurationMinutes,
	calculateHourlyRate,
	calculateOvertimePay,
	getWeekBounds,
} from "#/attendance/domain/overtime-calculator.ts";
import {
	AttendanceRepo,
	type TAttendanceRepoId,
} from "#/attendance/domain/attendance.ts";
import { EmployeeRepo, type TEmployeeRepoId } from "#/employee/index.ts";
import { type EDatabase, ENotFound } from "#/shared/errors.ts";

export const overtimeCalculate = Effect.fn("overtimeCalculate")(function* (
	input: Omit<TOvertimeCreateInput, "reason" | "taskDescription">,
): Effect.fn.Return<
	TOvertimeCalculation,
	ENotFound | EDatabase,
	TAttendanceRepoId | TEmployeeRepoId
> {
	const attendanceRepo = yield* AttendanceRepo;
	const employeeRepo = yield* EmployeeRepo;

	const employee = yield* employeeRepo.findById(input.employeeId);
	if (employee === null) {
		return yield* new ENotFound({ message: EMPLOYEE_MESSAGE.NOT_FOUND });
	}

	const durationMinutes = calculateDurationMinutes(
		input.startTime,
		input.endTime,
	);
	const hourlyRate = calculateHourlyRate(employee.basicSalary);
	const { weekStart, weekEnd } = getWeekBounds(input.overtimeDate);
	const weeklyAccumulated = yield* attendanceRepo.getWeeklyOvertimeMinutes(
		input.employeeId,
		weekStart,
		weekEnd,
	);

	const calc = calculateOvertimePay(
		durationMinutes,
		hourlyRate,
		input.dayType,
		input.workScheduleType,
		weeklyAccumulated,
	);

	return overtimeCalculationSchema.parse({
		employeeId: input.employeeId,
		overtimeDate: input.overtimeDate,
		durationMinutes,
		hourlyRate,
		dayType: input.dayType,
		workScheduleType: input.workScheduleType,
		totalAmount: calc.totalAmount,
		breakdown: calc.breakdown,
		isOverDailyLimit: calc.isOverDailyLimit,
		isOverWeeklyLimit: calc.isOverWeeklyLimit,
		weeklyAccumulatedMinutes: calc.weeklyAccumulatedMinutes,
		complianceWarnings: calc.complianceWarnings,
	});
});
