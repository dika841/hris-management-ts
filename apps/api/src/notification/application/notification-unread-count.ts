import { Effect } from "effect";
import {
	NotificationRepo,
	type TNotificationRepoId,
} from "#/notification/domain/notification.ts";
import type { EDatabase } from "#/shared/errors.ts";

export const notificationUnreadCount = Effect.fn("notificationUnreadCount")(
	function* (
		userId: string,
	): Effect.fn.Return<{ count: number }, EDatabase, TNotificationRepoId> {
		const repo = yield* NotificationRepo;
		const count = yield* repo.unreadCount(userId);
		return { count };
	},
);
