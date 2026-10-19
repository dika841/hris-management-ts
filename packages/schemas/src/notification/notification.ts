import { z } from "zod";
import { baseSchema, type TEntityOf } from "../shared/base-schema.ts";
import { paginationSchema, paginated } from "../shared/pagination.ts";

export const notificationIdSchema = z.string().min(1);

export const NOTIFICATION_TYPE = {
	LEAVE_STATUS: "leave_status",
	OVERTIME_STATUS: "overtime_status",
	PAYROLL_PAID: "payroll_paid",
	PAYSLIP: "payslip",
	CONTRACT_EXPIRY: "contract_expiry",
	SYSTEM: "system",
} as const;
export type TNotificationType =
	(typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

export const notificationTypeSchema = z.enum([
	NOTIFICATION_TYPE.LEAVE_STATUS,
	NOTIFICATION_TYPE.OVERTIME_STATUS,
	NOTIFICATION_TYPE.PAYROLL_PAID,
	NOTIFICATION_TYPE.PAYSLIP,
	NOTIFICATION_TYPE.CONTRACT_EXPIRY,
	NOTIFICATION_TYPE.SYSTEM,
]);

export const notificationSchema = baseSchema(notificationIdSchema).extend({
	userId: z.string(),
	type: notificationTypeSchema,
	title: z.string(),
	body: z.string(),
	link: z.string().nullable(),
	readAt: z.string().nullable(),
});
export type TNotification = TEntityOf<z.infer<typeof notificationSchema>>;

export const notificationListInputSchema = paginationSchema;
export type TNotificationListInput = z.infer<
	typeof notificationListInputSchema
>;

export const notificationListSchema = paginated(notificationSchema);
export type TNotificationList = z.infer<typeof notificationListSchema>;

export const notificationUnreadCountSchema = z.object({
	count: z.number().int().nonnegative(),
});
export type TNotificationUnreadCount = z.infer<
	typeof notificationUnreadCountSchema
>;

export const notificationMarkReadInputSchema = z.object({
	id: notificationIdSchema,
});
export type TNotificationMarkReadInput = z.infer<
	typeof notificationMarkReadInputSchema
>;

export const notificationCreateInputSchema = z.object({
	userId: z.string().min(1),
	type: notificationTypeSchema,
	title: z.string().min(1).max(200),
	body: z.string().min(1).max(1000),
	link: z.string().max(500).optional(),
});
export type TNotificationCreateInput = z.infer<
	typeof notificationCreateInputSchema
>;
