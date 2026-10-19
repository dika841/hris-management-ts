import { z } from "zod";
import { attendanceStatusSchema } from "../attendance/attendance.ts";
import { leaveRequestCreateInputSchema } from "../attendance/leave.ts";
import { overtimeCreateInputSchema } from "../attendance/overtime.ts";
import { employeeSchema } from "../employee/employee.ts";
import { paginationSchema } from "../shared/pagination.ts";

export const selfProfileSchema = z.union([
	z.object({ linked: z.literal(false) }),
	z.object({ linked: z.literal(true), employee: employeeSchema }),
]);
export type TSelfProfile = z.infer<typeof selfProfileSchema>;

export const selfAttendanceListInputSchema = paginationSchema.extend({
	month: z.number().int().min(1).max(12).optional(),
	year: z.number().int().optional(),
	status: attendanceStatusSchema.optional(),
});
export type TSelfAttendanceListInput = z.infer<
	typeof selfAttendanceListInputSchema
>;

export const selfAttendanceSummaryInputSchema = z.object({
	month: z.number().int().min(1).max(12),
	year: z.number().int(),
});
export type TSelfAttendanceSummaryInput = z.infer<
	typeof selfAttendanceSummaryInputSchema
>;

export const selfLeaveCreateInputSchema = leaveRequestCreateInputSchema.omit({
	employeeId: true,
});
export type TSelfLeaveCreateInput = z.infer<typeof selfLeaveCreateInputSchema>;

export const selfOvertimeCreateInputSchema = overtimeCreateInputSchema.omit({
	employeeId: true,
});
export type TSelfOvertimeCreateInput = z.infer<
	typeof selfOvertimeCreateInputSchema
>;

export const selfPayslipListInputSchema = paginationSchema;
export type TSelfPayslipListInput = z.infer<typeof selfPayslipListInputSchema>;

export const selfAttendanceListSchema = z.object({
	items: z.array(
		z.object({
			id: z.string(),
			attendanceDate: z.string(),
			checkIn: z.string().nullable(),
			checkOut: z.string().nullable(),
			status: attendanceStatusSchema,
			lateMinutes: z.number().int().nonnegative(),
			earlyDepartureMinutes: z.number().int().nonnegative(),
			effectiveWorkMinutes: z.number().int().nonnegative(),
			notes: z.string().nullable(),
		}),
	),
	total: z.number().int().nonnegative(),
	page: z.number().int().positive(),
	pageSize: z.number().int().positive(),
});
export type TSelfAttendanceList = z.infer<typeof selfAttendanceListSchema>;
