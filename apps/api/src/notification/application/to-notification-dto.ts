import { type TNotification, notificationSchema } from "@app/schemas";
import type { TNotificationRow } from "#/notification/domain/notification.ts";

export const toNotificationDto = (row: TNotificationRow): TNotification =>
	notificationSchema.parse({
		id: row.id,
		userId: row.userId,
		type: row.type,
		title: row.title,
		body: row.body,
		link: row.link,
		readAt: row.readAt ? row.readAt.toISOString() : null,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	});
