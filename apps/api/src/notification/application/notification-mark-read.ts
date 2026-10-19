import { Effect } from "effect";
import {
	NotificationRepo,
	type TNotificationRepoId,
} from "#/notification/domain/notification.ts";
import { ENotFound, type EDatabase } from "#/shared/errors.ts";

export const notificationMarkRead = Effect.fn("notificationMarkRead")(
	function* (
		userId: string,
		id: string,
	): Effect.fn.Return<
		{ id: string },
		ENotFound | EDatabase,
		TNotificationRepoId
	> {
		const repo = yield* NotificationRepo;
		const found = yield* repo.markRead(userId, id);
		if (!found) {
			return yield* new ENotFound({ message: "Notification not found." });
		}
		return { id };
	},
);
