import { and, count, desc, eq, isNull } from "drizzle-orm";
import { Effect, Layer } from "effect";
import { DbService, dbServiceLayer } from "#/platform/db/db-service.ts";
import { notification } from "#/platform/db/tables/notification.ts";
import { dbActive } from "#/platform/db/transaction.ts";
import { EDatabase } from "#/shared/errors.ts";
import { offsetFor } from "#/shared/pagination.ts";
import {
	NotificationRepo,
	type TNotificationListInput,
	type TNotificationRepo,
	type TNotificationRow,
} from "#/notification/domain/notification.ts";

export const notificationRepoLayer = Layer.effect(
	NotificationRepo,
	Effect.gen(function* () {
		const { db } = yield* DbService;

		const list: TNotificationRepo["list"] = ({
			userId,
			page,
			pageSize,
		}: TNotificationListInput) =>
			Effect.tryPromise({
				try: async () => {
					const [items, [{ value: total }]] = await Promise.all([
						dbActive(db)
							.select()
							.from(notification)
							.where(eq(notification.userId, userId))
							.orderBy(desc(notification.createdAt))
							.limit(pageSize)
							.offset(offsetFor({ page, pageSize })),
						dbActive(db)
							.select({ value: count() })
							.from(notification)
							.where(eq(notification.userId, userId)),
					]);
					return { items: items as TNotificationRow[], total };
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const unreadCount: TNotificationRepo["unreadCount"] = (userId) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.select({ value: count() })
						.from(notification)
						.where(
							and(eq(notification.userId, userId), isNull(notification.readAt)),
						);
					return row?.value ?? 0;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const create: TNotificationRepo["create"] = (data) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.insert(notification)
						.values(data)
						.returning();
					return row as TNotificationRow;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const markRead: TNotificationRepo["markRead"] = (userId, id) =>
			Effect.tryPromise({
				try: async () => {
					const rows = await dbActive(db)
						.update(notification)
						.set({ readAt: new Date(), updatedAt: new Date() })
						.where(
							and(eq(notification.id, id), eq(notification.userId, userId)),
						)
						.returning({ id: notification.id });
					return rows.length > 0;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const markAllRead: TNotificationRepo["markAllRead"] = (userId) =>
			Effect.tryPromise({
				try: async () => {
					const rows = await dbActive(db)
						.update(notification)
						.set({ readAt: new Date(), updatedAt: new Date() })
						.where(
							and(eq(notification.userId, userId), isNull(notification.readAt)),
						)
						.returning({ id: notification.id });
					return rows.length;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		return NotificationRepo.of({
			list,
			unreadCount,
			create,
			markRead,
			markAllRead,
		});
	}),
).pipe(Layer.provide(dbServiceLayer));
