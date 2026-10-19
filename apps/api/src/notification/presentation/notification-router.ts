import {
	notificationListInputSchema,
	notificationListSchema,
	notificationMarkReadInputSchema,
	notificationUnreadCountSchema,
} from "@app/schemas";
import { z } from "zod";
import { notificationList } from "#/notification/application/notification-list.ts";
import { notificationMarkAllRead } from "#/notification/application/notification-mark-all-read.ts";
import { notificationMarkRead } from "#/notification/application/notification-mark-read.ts";
import { notificationUnreadCount } from "#/notification/application/notification-unread-count.ts";
import { HTTP_METHOD } from "#/platform/http/http-methods.ts";
import { protectedProcedure } from "#/platform/orpc/middleware.ts";
import { effectRun } from "#/platform/orpc/run-effect.ts";

const notificationRouter = {
	list: protectedProcedure
		.route({ method: HTTP_METHOD.GET, path: "/notifications" })
		.input(notificationListInputSchema)
		.output(notificationListSchema)
		.handler(({ input, context }) =>
			effectRun(
				context.runtime,
				notificationList(context.session!.user.id, input),
			),
		),

	unreadCount: protectedProcedure
		.route({ method: HTTP_METHOD.GET, path: "/notifications/unread-count" })
		.output(notificationUnreadCountSchema)
		.handler(({ context }) =>
			effectRun(
				context.runtime,
				notificationUnreadCount(context.session!.user.id),
			),
		),

	markRead: protectedProcedure
		.route({ method: HTTP_METHOD.PATCH, path: "/notifications/{id}/read" })
		.input(notificationMarkReadInputSchema)
		.output(z.object({ id: z.string() }))
		.handler(({ input, context }) =>
			effectRun(
				context.runtime,
				notificationMarkRead(context.session!.user.id, input.id),
			),
		),

	markAllRead: protectedProcedure
		.route({ method: HTTP_METHOD.POST, path: "/notifications/read-all" })
		.output(z.object({ count: z.number().int().nonnegative() }))
		.handler(({ context }) =>
			effectRun(
				context.runtime,
				notificationMarkAllRead(context.session!.user.id),
			),
		),
};

export type TNotificationRouter = typeof notificationRouter;

export const notificationRouterBuild = (): TNotificationRouter =>
	notificationRouter;
