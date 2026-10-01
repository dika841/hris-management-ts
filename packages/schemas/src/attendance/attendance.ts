import { z } from "zod";
import { baseSchema, type TEntityOf } from "../shared/base-schema.ts";
import { paginated, paginationSchema } from "../shared/pagination.ts";

export const ATTENDANCE_STATUS = {
	PRESENT: "present",
	SICK: "sick",
	PERMITTED: "permitted",
	ABSENT: "absent",
	HOLIDAY: "holiday",
	LEAVE: "leave",
	OFF: "off",
} as const;
export type TAttendanceStatus =
	(typeof ATTENDANCE_STATUS)[keyof typeof ATTENDANCE_STATUS];

export const attendanceStatusSchema = z.enum([
	ATTENDANCE_STATUS.PRESENT,
	ATTENDANCE_STATUS.SICK,
	ATTENDANCE_STATUS.PERMITTED,
	ATTENDANCE_STATUS.ABSENT,
	ATTENDANCE_STATUS.HOLIDAY,
	ATTENDANCE_STATUS.LEAVE,
	ATTENDANCE_STATUS.OFF,
]);

export const attendanceLogIdSchema = z.string().min(1);

export const attendanceLogSchema = baseSchema(attendanceLogIdSchema).extend({
	employeeId: z.string(),
	attendanceDate: z.string(),
	checkIn: z.string().nullable(),
	checkOut: z.string().nullable(),
	status: attendanceStatusSchema,
	lateMinutes: z.number().int().nonnegative(),
	earlyDepartureMinutes: z.number().int().nonnegative(),
	effectiveWorkMinutes: z.number().int().nonnegative(),
	leaveRequestId: z.string().nullable(),
	notes: z.string().nullable(),
	isHoliday: z.boolean(),
	holidayName: z.string().nullable(),
});
export type TAttendanceLog = TEntityOf<z.infer<typeof attendanceLogSchema>>;

export const attendanceLogInputSchema = z.object({
	employeeId: z.string().min(1),
	attendanceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	checkIn: z.string().datetime({ offset: true }).optional(),
	checkOut: z.string().datetime({ offset: true }).optional(),
	status: attendanceStatusSchema.default(ATTENDANCE_STATUS.PRESENT),
	notes: z.string().max(500).optional(),
});
export type TAttendanceLogInput = z.infer<typeof attendanceLogInputSchema>;

export const attendanceBulkLogInputSchema = z.object({
	logs: z.array(attendanceLogInputSchema).min(1).max(500),
});
export type TAttendanceBulkLogInput = z.infer<
	typeof attendanceBulkLogInputSchema
>;

export const attendanceListInputSchema = paginationSchema.extend({
	employeeId: z.string().optional(),
	month: z.number().int().min(1).max(12).optional(),
	year: z.number().int().optional(),
	status: attendanceStatusSchema.optional(),
});
export type TAttendanceListInput = z.infer<typeof attendanceListInputSchema>;

export const attendanceListSchema = paginated(attendanceLogSchema);
export type TAttendanceList = z.infer<typeof attendanceListSchema>;

export const attendanceSummarySchema = z.object({
	employeeId: z.string(),
	month: z.number().int(),
	year: z.number().int(),
	totalPresent: z.number().int(),
	totalSick: z.number().int(),
	totalPermitted: z.number().int(),
	totalAbsent: z.number().int(),
	totalLeave: z.number().int(),
	totalLateMinutes: z.number().int(),
	totalEffectiveWorkMinutes: z.number().int(),
	totalWorkingDays: z.number().int(),
});
export type TAttendanceSummary = z.infer<typeof attendanceSummarySchema>;
