import {
	type UseMutationResult,
	type UseQueryResult,
	type UseSuspenseQueryOptions,
	type UseSuspenseQueryResult,
	useQuery,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { orpc } from "#/libs/orpc/client.ts";
import { useProcedureMutation } from "#/libs/orpc/procedure-mutation.ts";
import { suspenseQueryOptionsFor } from "#/libs/orpc/procedure-query.ts";
import type {
	TClientErrors,
	TClientInputs,
	TClientOutputs,
} from "#/libs/orpc/types.ts";

type TNotificationOut = TClientOutputs["notification"];
type TNotificationIn = TClientInputs["notification"];
type TNotificationErr = TClientErrors["notification"];

export const notificationKeys = (): readonly (readonly unknown[])[] => [
	orpc.notification.key(),
];

export const notificationListOptions = (
	input: TNotificationIn["list"],
): UseSuspenseQueryOptions<TNotificationOut["list"]> =>
	suspenseQueryOptionsFor(orpc.notification.list, input);

export const useNotificationList = (
	input: TNotificationIn["list"],
): UseSuspenseQueryResult<TNotificationOut["list"]> =>
	useSuspenseQuery(notificationListOptions(input));

export const useNotificationRecent = (): UseQueryResult<
	TNotificationOut["list"]
> =>
	useQuery({
		...orpc.notification.list.queryOptions({
			input: { page: 1, pageSize: 5 },
		}),
		queryKey: orpc.notification.list.key({
			input: { page: 1, pageSize: 5 },
		}),
	});

export const useNotificationUnreadCount = (): UseQueryResult<
	TNotificationOut["unreadCount"]
> =>
	useQuery({
		...orpc.notification.unreadCount.queryOptions({
			queryKey: orpc.notification.unreadCount.key(),
		}),
		queryKey: orpc.notification.unreadCount.key(),
		refetchInterval: 30_000,
	});

export const useNotificationMarkRead = (): UseMutationResult<
	TNotificationOut["markRead"],
	TNotificationErr["markRead"],
	TNotificationIn["markRead"]
> =>
	useProcedureMutation(orpc.notification.markRead, {
		message: "Notification marked as read.",
		invalidates: notificationKeys(),
	});

export const useNotificationMarkAllRead = (): UseMutationResult<
	TNotificationOut["markAllRead"],
	TNotificationErr["markAllRead"],
	TNotificationIn["markAllRead"]
> =>
	useProcedureMutation(orpc.notification.markAllRead, {
		message: "All notifications marked as read.",
		invalidates: notificationKeys(),
	});
