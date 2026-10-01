import { z } from "zod";
import { baseSchema, type TEntityOf } from "../shared/base-schema.ts";
import { paginated, paginationSchema } from "../shared/pagination.ts";

export const LEAVE_CATEGORY = {
	PAID: "paid",
	UNPAID: "unpaid",
	SPECIAL_PAID: "special_paid",
} as const;
export type TLeaveCategory =
	(typeof LEAVE_CATEGORY)[keyof typeof LEAVE_CATEGORY];

export const LEAVE_CODE = {
	ANNUAL: "annual",
	SICK: "sick",
	MATERNITY: "maternity",
	PATERNITY: "paternity",
	MENSTRUAL: "menstrual",
	MISCARRIAGE: "miscarriage",
	LONG_SICK: "long_sick",
	EMERGENCY: "emergency",
	UNPAID: "unpaid",
} as const;
export type TLeaveCode = (typeof LEAVE_CODE)[keyof typeof LEAVE_CODE];

export const leaveTypeIdSchema = z.string().min(1);

export const leaveCategorySchema = z.enum([
	LEAVE_CATEGORY.PAID,
	LEAVE_CATEGORY.UNPAID,
	LEAVE_CATEGORY.SPECIAL_PAID,
]);

export const leaveTypeSchema = baseSchema(leaveTypeIdSchema).extend({
	code: z.string(),
	name: z.string(),
	category: leaveCategorySchema,
	description: z.string().nullable(),
	defaultDays: z.number().int().nonnegative(),
	requiresDoctorNote: z.boolean(),
	requiresSpouseNote: z.boolean(),
	genderRestriction: z.enum(["male", "female"]).nullable(),
	salaryPercentage: z.number().int().min(0).max(100),
	isActive: z.boolean(),
	isSystem: z.boolean(),
});
export type TLeaveType = TEntityOf<z.infer<typeof leaveTypeSchema>>;

export const leaveTypeCreateInputSchema = z.object({
	code: z.string().min(1).max(50),
	name: z.string().min(1).max(100),
	category: leaveCategorySchema,
	description: z.string().max(500).optional(),
	defaultDays: z.number().int().nonnegative().default(0),
	requiresDoctorNote: z.boolean().default(false),
	requiresSpouseNote: z.boolean().default(false),
	genderRestriction: z.enum(["male", "female"]).optional(),
	salaryPercentage: z.number().int().min(0).max(100).default(100),
	isActive: z.boolean().default(true),
});
export type TLeaveTypeCreateInput = z.infer<typeof leaveTypeCreateInputSchema>;

export const leaveTypeUpdateInputSchema = leaveTypeCreateInputSchema
	.partial()
	.extend({
		id: leaveTypeIdSchema,
	});
export type TLeaveTypeUpdateInput = z.infer<typeof leaveTypeUpdateInputSchema>;

export const leaveBalanceSchema = baseSchema(z.string()).extend({
	employeeId: z.string(),
	leaveTypeId: z.string(),
	year: z.number().int(),
	allocatedDays: z.number().int().nonnegative(),
	carryOverDays: z.number().int().nonnegative(),
	usedDays: z.number().int().nonnegative(),
	pendingDays: z.number().int().nonnegative(),
	forfeitedDays: z.number().int().nonnegative(),
	remainingDays: z.number().int(),
});
export type TLeaveBalance = TEntityOf<z.infer<typeof leaveBalanceSchema>>;

export const LEAVE_REQUEST_STATUS = {
	PENDING: "pending",
	APPROVED: "approved",
	REJECTED: "rejected",
	CANCELLED: "cancelled",
} as const;
export type TLeaveRequestStatus =
	(typeof LEAVE_REQUEST_STATUS)[keyof typeof LEAVE_REQUEST_STATUS];

export const leaveRequestIdSchema = z.string().min(1);

export const leaveRequestStatusSchema = z.enum([
	LEAVE_REQUEST_STATUS.PENDING,
	LEAVE_REQUEST_STATUS.APPROVED,
	LEAVE_REQUEST_STATUS.REJECTED,
	LEAVE_REQUEST_STATUS.CANCELLED,
]);

export const leaveRequestSchema = baseSchema(leaveRequestIdSchema).extend({
	employeeId: z.string(),
	leaveTypeId: z.string(),
	leaveTypeName: z.string().optional(),
	startDate: z.string(),
	endDate: z.string(),
	totalDays: z.number().int().positive(),
	reason: z.string().nullable(),
	doctorNoteUrl: z.string().nullable(),
	attachmentUrl: z.string().nullable(),
	status: leaveRequestStatusSchema,
	approverId: z.string().nullable(),
	approvedAt: z.string().nullable(),
	rejectionReason: z.string().nullable(),
	salaryPercentageAtTime: z.number().int().min(0).max(100),
	notes: z.string().nullable(),
});
export type TLeaveRequest = TEntityOf<z.infer<typeof leaveRequestSchema>>;

export const leaveRequestCreateInputSchema = z.object({
	employeeId: z.string().min(1),
	leaveTypeId: z.string().min(1),
	startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	reason: z.string().max(1000).optional(),
	doctorNoteUrl: z.string().url().optional(),
	attachmentUrl: z.string().url().optional(),
});
export type TLeaveRequestCreateInput = z.infer<
	typeof leaveRequestCreateInputSchema
>;

export const leaveRequestApproveInputSchema = z.object({
	id: leaveRequestIdSchema,
	notes: z.string().max(500).optional(),
});
export type TLeaveRequestApproveInput = z.infer<
	typeof leaveRequestApproveInputSchema
>;

export const leaveRequestRejectInputSchema = z.object({
	id: leaveRequestIdSchema,
	rejectionReason: z.string().min(1).max(500),
});
export type TLeaveRequestRejectInput = z.infer<
	typeof leaveRequestRejectInputSchema
>;

export const leaveRequestCancelInputSchema = z.object({
	id: leaveRequestIdSchema,
});
export type TLeaveRequestCancelInput = z.infer<
	typeof leaveRequestCancelInputSchema
>;

export const leaveRequestListInputSchema = paginationSchema.extend({
	employeeId: z.string().optional(),
	leaveTypeId: z.string().optional(),
	status: leaveRequestStatusSchema.optional(),
	year: z.number().int().optional(),
});
export type TLeaveRequestListInput = z.infer<
	typeof leaveRequestListInputSchema
>;

export const leaveRequestListSchema = paginated(leaveRequestSchema);
export type TLeaveRequestList = z.infer<typeof leaveRequestListSchema>;
