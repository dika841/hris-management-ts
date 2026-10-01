import { z } from "zod";
import { baseSchema, type TEntityOf } from "../shared/base-schema.ts";
import { paginated, paginationSchema } from "../shared/pagination.ts";

export const OVERTIME_DAY_TYPE = {
	WORKDAY: "workday",
	WEEKLY_OFF: "weekly_off",
	NATIONAL_HOLIDAY: "national_holiday",
} as const;
export type TOvertimeDayType =
	(typeof OVERTIME_DAY_TYPE)[keyof typeof OVERTIME_DAY_TYPE];

export const WORK_SCHEDULE_TYPE = {
	FIVE_DAYS: "5_days",
	SIX_DAYS: "6_days",
} as const;
export type TWorkScheduleType =
	(typeof WORK_SCHEDULE_TYPE)[keyof typeof WORK_SCHEDULE_TYPE];

export const OVERTIME_STATUS = {
	PENDING: "pending",
	APPROVED: "approved",
	REJECTED: "rejected",
	CANCELLED: "cancelled",
} as const;
export type TOvertimeStatus =
	(typeof OVERTIME_STATUS)[keyof typeof OVERTIME_STATUS];

export const overtimeRequestIdSchema = z.string().min(1);

export const overtimeDayTypeSchema = z.enum([
	OVERTIME_DAY_TYPE.WORKDAY,
	OVERTIME_DAY_TYPE.WEEKLY_OFF,
	OVERTIME_DAY_TYPE.NATIONAL_HOLIDAY,
]);

export const workScheduleTypeSchema = z.enum([
	WORK_SCHEDULE_TYPE.FIVE_DAYS,
	WORK_SCHEDULE_TYPE.SIX_DAYS,
]);

export const overtimeStatusSchema = z.enum([
	OVERTIME_STATUS.PENDING,
	OVERTIME_STATUS.APPROVED,
	OVERTIME_STATUS.REJECTED,
	OVERTIME_STATUS.CANCELLED,
]);

export const overtimeRequestSchema = baseSchema(overtimeRequestIdSchema).extend(
	{
		employeeId: z.string(),
		overtimeDate: z.string(),
		startTime: z.string(),
		endTime: z.string(),
		durationMinutes: z.number().int().nonnegative(),
		dayType: overtimeDayTypeSchema,
		workScheduleType: workScheduleTypeSchema,
		reason: z.string().nullable(),
		taskDescription: z.string().nullable(),
		status: overtimeStatusSchema,
		approverId: z.string().nullable(),
		approvedAt: z.string().nullable(),
		rejectionReason: z.string().nullable(),
		calculatedAmount: z.number().int().nonnegative(),
		hourlyRate: z.number().int().nonnegative(),
		isOverDailyLimit: z.boolean(),
		isOverWeeklyLimit: z.boolean(),
		weeklyAccumulatedMinutes: z.number().int().nonnegative(),
		notes: z.string().nullable(),
	},
);
export type TOvertimeRequest = TEntityOf<z.infer<typeof overtimeRequestSchema>>;

export const overtimeCreateInputSchema = z.object({
	employeeId: z.string().min(1),
	overtimeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	startTime: z.string().regex(/^\d{2}:\d{2}$/),
	endTime: z.string().regex(/^\d{2}:\d{2}$/),
	dayType: overtimeDayTypeSchema.default(OVERTIME_DAY_TYPE.WORKDAY),
	workScheduleType: workScheduleTypeSchema.default(
		WORK_SCHEDULE_TYPE.FIVE_DAYS,
	),
	reason: z.string().max(500).optional(),
	taskDescription: z.string().max(1000).optional(),
});
export type TOvertimeCreateInput = z.infer<typeof overtimeCreateInputSchema>;

export const overtimeApproveInputSchema = z.object({
	id: overtimeRequestIdSchema,
	notes: z.string().max(500).optional(),
});
export type TOvertimeApproveInput = z.infer<typeof overtimeApproveInputSchema>;

export const overtimeRejectInputSchema = z.object({
	id: overtimeRequestIdSchema,
	rejectionReason: z.string().min(1).max(500),
});
export type TOvertimeRejectInput = z.infer<typeof overtimeRejectInputSchema>;

export const overtimeListInputSchema = paginationSchema.extend({
	employeeId: z.string().optional(),
	status: overtimeStatusSchema.optional(),
	month: z.number().int().min(1).max(12).optional(),
	year: z.number().int().optional(),
});
export type TOvertimeListInput = z.infer<typeof overtimeListInputSchema>;

export const overtimeListSchema = paginated(overtimeRequestSchema);
export type TOvertimeList = z.infer<typeof overtimeListSchema>;

// ============================================================
// OVERTIME CALCULATION RESULT (PP 35/2021)
// ============================================================
export const overtimeCalculationSchema = z.object({
	employeeId: z.string(),
	overtimeDate: z.string(),
	durationMinutes: z.number().int(),
	hourlyRate: z.number().int(),
	dayType: overtimeDayTypeSchema,
	workScheduleType: workScheduleTypeSchema,
	totalAmount: z.number().int(),
	breakdown: z.array(
		z.object({
			hour: z.number().int(),
			multiplier: z.number(),
			amount: z.number().int(),
			label: z.string(),
		}),
	),
	isOverDailyLimit: z.boolean(),
	isOverWeeklyLimit: z.boolean(),
	weeklyAccumulatedMinutes: z.number().int(),
	complianceWarnings: z.array(z.string()),
});
export type TOvertimeCalculation = z.infer<typeof overtimeCalculationSchema>;

// ============================================================
// PUBLIC HOLIDAY
// ============================================================
export const PUBLIC_HOLIDAY_TYPE = {
	NATIONAL: "national",
	JOINT_LEAVE: "joint_leave",
} as const;
export type TPublicHolidayType =
	(typeof PUBLIC_HOLIDAY_TYPE)[keyof typeof PUBLIC_HOLIDAY_TYPE];

export const publicHolidayIdSchema = z.string().min(1);

export const publicHolidayTypeSchema = z.enum([
	PUBLIC_HOLIDAY_TYPE.NATIONAL,
	PUBLIC_HOLIDAY_TYPE.JOINT_LEAVE,
]);

export const publicHolidaySchema = z.object({
	id: publicHolidayIdSchema,
	date: z.string(),
	name: z.string(),
	type: publicHolidayTypeSchema,
	year: z.number().int(),
	description: z.string().nullable(),
	createdAt: z.string(),
});
export type TPublicHoliday = z.infer<typeof publicHolidaySchema>;

export const publicHolidayCreateInputSchema = z.object({
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	name: z.string().min(1).max(200),
	type: publicHolidayTypeSchema.default(PUBLIC_HOLIDAY_TYPE.NATIONAL),
	description: z.string().max(500).optional(),
});
export type TPublicHolidayCreateInput = z.infer<
	typeof publicHolidayCreateInputSchema
>;

export const publicHolidayListInputSchema = z.object({
	year: z.number().int().optional(),
});
export type TPublicHolidayListInput = z.infer<
	typeof publicHolidayListInputSchema
>;
