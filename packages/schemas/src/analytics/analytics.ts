import { z } from "zod";
import { attendanceStatusSchema } from "../attendance/attendance.ts";
import { employmentStatusSchema } from "../employee/employee.ts";
import { payrollPeriodStatusSchema } from "../payroll/payroll.ts";

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const analyticsOverviewInputSchema = z.object({
	from: dateStringSchema,
	to: dateStringSchema,
});
export type TAnalyticsOverviewInput = z.infer<
	typeof analyticsOverviewInputSchema
>;

export const analyticsOverviewSchema = z.object({
	headcount: z.object({
		total: z.number().int().nonnegative(),
		permanent: z.number().int().nonnegative(),
		contract: z.number().int().nonnegative(),
		probation: z.number().int().nonnegative(),
		intern: z.number().int().nonnegative(),
	}),
	movement: z.object({
		newHires: z.number().int().nonnegative(),
		exits: z.number().int().nonnegative(),
		turnoverRate: z.number().nonnegative(),
	}),
	byDepartment: z.array(
		z.object({
			department: z.string(),
			count: z.number().int().nonnegative(),
		}),
	),
	byStatus: z.array(
		z.object({
			status: employmentStatusSchema,
			count: z.number().int().nonnegative(),
		}),
	),
});
export type TAnalyticsOverview = z.infer<typeof analyticsOverviewSchema>;

export const analyticsPayrollTrendInputSchema = z.object({
	year: z.number().int().min(2000).max(2100),
});
export type TAnalyticsPayrollTrendInput = z.infer<
	typeof analyticsPayrollTrendInputSchema
>;

export const analyticsPayrollTrendSchema = z.array(
	z.object({
		id: z.string(),
		name: z.string(),
		month: z.number().int().min(1).max(12),
		year: z.number().int(),
		status: payrollPeriodStatusSchema,
		totalEmployees: z.number().int().nonnegative(),
		totalGross: z.number().int(),
		totalPph21: z.number().int(),
		totalNetPay: z.number().int(),
	}),
);
export type TAnalyticsPayrollTrend = z.infer<
	typeof analyticsPayrollTrendSchema
>;

export const analyticsAttendanceInputSchema = z.object({
	month: z.number().int().min(1).max(12),
	year: z.number().int().min(2000).max(2100),
});
export type TAnalyticsAttendanceInput = z.infer<
	typeof analyticsAttendanceInputSchema
>;

export const analyticsAttendanceSchema = z.object({
	totalLogs: z.number().int().nonnegative(),
	byStatus: z.array(
		z.object({
			status: attendanceStatusSchema,
			count: z.number().int().nonnegative(),
		}),
	),
	totalLateMinutes: z.number().int().nonnegative(),
	totalEffectiveWorkMinutes: z.number().int().nonnegative(),
});
export type TAnalyticsAttendance = z.infer<typeof analyticsAttendanceSchema>;
