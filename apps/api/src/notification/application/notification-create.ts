import type { TNotification, TNotificationCreateInput } from "@app/schemas";
import { Effect } from "effect";
import { toNotificationDto } from "#/notification/application/to-notification-dto.ts";
import {
	NotificationRepo,
	type TNotificationRepoId,
} from "#/notification/domain/notification.ts";
import type { EDatabase } from "#/shared/errors.ts";

export const notificationCreate = Effect.fn("notificationCreate")(function* (
	input: TNotificationCreateInput,
): Effect.fn.Return<TNotification, EDatabase, TNotificationRepoId> {
	const repo = yield* NotificationRepo;
	const row = yield* repo.create({
		userId: input.userId,
		type: input.type,
		title: input.title,
		body: input.body,
		link: input.link ?? null,
		readAt: null,
	});
	return toNotificationDto(row);
});
