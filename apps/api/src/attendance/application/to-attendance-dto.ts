import {
	type TAttendanceLog,
	type TOvertimeRequest,
	type TPublicHoliday,
	attendanceLogSchema,
	overtimeRequestSchema,
	publicHolidaySchema,
} from "@app/schemas";
import type {
	TAttendanceLogRow,
	TOvertimeRequestRow,
	TPublicHolidayRow,
} from "#/attendance/domain/attendance.ts";

export const toAttendanceLogDto = (row: TAttendanceLogRow): TAttendanceLog =>
	attendanceLogSchema.parse({
		id: row.id,
		employeeId: row.employeeId,
		attendanceDate: row.attendanceDate,
		checkIn: row.checkIn ? row.checkIn.toISOString() : null,
		checkOut: row.checkOut ? row.checkOut.toISOString() : null,
		status: row.status,
		lateMinutes: row.lateMinutes,
		earlyDepartureMinutes: row.earlyDepartureMinutes,
		effectiveWorkMinutes: row.effectiveWorkMinutes,
		leaveRequestId: row.leaveRequestId,
		notes: row.notes,
		isHoliday: row.isHoliday,
		holidayName: row.holidayName,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	});

export const toOvertimeRequestDto = (
	row: TOvertimeRequestRow,
): TOvertimeRequest =>
	overtimeRequestSchema.parse({
		id: row.id,
		employeeId: row.employeeId,
		overtimeDate: row.overtimeDate,
		startTime: row.startTime,
		endTime: row.endTime,
		durationMinutes: row.durationMinutes,
		dayType: row.dayType,
		workScheduleType: row.workScheduleType,
		reason: row.reason,
		taskDescription: row.taskDescription,
		status: row.status,
		approverId: row.approverId,
		approvedAt: row.approvedAt ? row.approvedAt.toISOString() : null,
		rejectionReason: row.rejectionReason,
		calculatedAmount: row.calculatedAmount,
		hourlyRate: row.hourlyRate,
		isOverDailyLimit: row.isOverDailyLimit,
		isOverWeeklyLimit: row.isOverWeeklyLimit,
		weeklyAccumulatedMinutes: row.weeklyAccumulatedMinutes,
		notes: row.notes,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	});

export const toPublicHolidayDto = (row: TPublicHolidayRow): TPublicHoliday =>
	publicHolidaySchema.parse({
		id: row.id,
		date: row.date,
		name: row.name,
		type: row.type,
		year: row.year,
		description: row.description,
		createdAt: row.createdAt.toISOString(),
	});
