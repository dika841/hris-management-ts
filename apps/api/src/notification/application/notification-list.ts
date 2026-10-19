import type { TNotificationList, TNotificationListInput } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { Effect } from "effect";
import { toNotificationDto } from "#/notification/application/to-notification-dto.ts";
import {
	NotificationRepo,
	type TNotificationRepoId,
} from "#/notification/domain/notification.ts";
import type { EDatabase } from "#/shared/errors.ts";

export const notificationList = Effect.fn("notificationList")(function* (
	userId: string,
	input: TNotificationListInput,
): Effect.fn.Return<TNotificationList, EDatabase, TNotificationRepoId> {
	const repo = yield* NotificationRepo;
	const { items, total } = yield* repo.list({
		userId,
		page: input.page,
		pageSize: input.pageSize,
	});
	return {
		items: [...A.map(items, toNotificationDto)],
		total,
		page: input.page,
		pageSize: input.pageSize,
	};
});
