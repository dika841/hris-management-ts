import type { TNotificationType } from "@app/schemas";
import { Context, type Effect } from "effect";
import type { TBaseRow } from "#/shared/base-row.ts";
import type { EDatabase } from "#/shared/errors.ts";
import type { TRowPage } from "#/shared/pagination.ts";
import { REPO_TAG } from "#/shared/repo-tags.ts";
import type { TServiceId } from "#/shared/service-id.ts";

export type TNotificationRow = TBaseRow & {
	userId: string;
	type: TNotificationType;
	title: string;
	body: string;
	link: string | null;
	readAt: Date | null;
};

export type TNotificationListInput = {
	userId: string;
	page: number;
	pageSize: number;
};

export type TNotificationRepo = {
	list: (
		input: TNotificationListInput,
	) => Effect.Effect<TRowPage<TNotificationRow>, EDatabase>;
	unreadCount: (userId: string) => Effect.Effect<number, EDatabase>;
	create: (
		data: Omit<TNotificationRow, "id" | "createdAt" | "updatedAt">,
	) => Effect.Effect<TNotificationRow, EDatabase>;
	markRead: (userId: string, id: string) => Effect.Effect<boolean, EDatabase>;
	markAllRead: (userId: string) => Effect.Effect<number, EDatabase>;
};

export type TNotificationRepoId = TServiceId<typeof REPO_TAG.NOTIFICATION>;

export const NotificationRepo = Context.Service<
	TNotificationRepoId,
	TNotificationRepo
>(REPO_TAG.NOTIFICATION);
