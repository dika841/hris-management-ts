import { Effect } from "effect";
import {
	NotificationRepo,
	type TNotificationRepoId,
} from "#/notification/domain/notification.ts";
import type { EDatabase } from "#/shared/errors.ts";

export const notificationMarkAllRead = Effect.fn("notificationMarkAllRead")(
	function* (
		userId: string,
	): Effect.fn.Return<{ count: number }, EDatabase, TNotificationRepoId> {
		const repo = yield* NotificationRepo;
		const count = yield* repo.markAllRead(userId);
		return { count };
	},
);
