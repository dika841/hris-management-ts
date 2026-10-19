import { Button } from "@app/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@app/components/ui/card";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bell, CheckCheck } from "lucide-react";
import type { FC, ReactElement } from "react";
import { useI18n } from "#/libs/i18n/index.ts";
import {
	useNotificationList,
	useNotificationMarkAllRead,
	useNotificationMarkRead,
} from "#/routes/_authenticated/_hooks/use-notifications.ts";

const timeLabel = (value: string): string =>
	new Intl.DateTimeFormat("id-ID", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));

const NotificationsPage: FC = (): ReactElement => {
	const { isIndonesian } = useI18n();
	const navigate = useNavigate();
	const { data } = useNotificationList({ page: 1, pageSize: 50 });
	const markRead = useNotificationMarkRead();
	const markAllRead = useNotificationMarkAllRead();
	const unreadCount = data.items.filter((item) => item.readAt === null).length;

	const openNotification = (id: string, link: string | null): void => {
		markRead.mutate({ id });
		if (link) {
			void navigate({ href: link });
		}
	};

	return (
		<div className="flex max-w-3xl flex-col gap-6">
			<div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="flex items-center gap-2 text-xl font-bold tracking-tight">
						<Bell className="size-5 text-primary" />
						{isIndonesian ? "Notifikasi" : "Notifications"}
					</h1>
					<p className="mt-1 text-xs text-muted-foreground">
						{unreadCount}{" "}
						{isIndonesian ? "notifikasi belum dibaca" : "unread notifications"}
					</p>
				</div>
				{unreadCount > 0 && (
					<Button
						size="sm"
						variant="outline"
						onClick={() => markAllRead.mutate(undefined)}
						disabled={markAllRead.isPending}
						className="w-fit gap-1.5 text-xs"
					>
						<CheckCheck className="size-3.5" />
						{isIndonesian ? "Tandai semua dibaca" : "Mark all as read"}
					</Button>
				)}
			</div>

			{data.items.length === 0 ? (
				<Card>
					<CardContent className="py-12 text-center text-sm text-muted-foreground">
						{isIndonesian
							? "Belum ada notifikasi."
							: "There are no notifications yet."}
					</CardContent>
				</Card>
			) : (
				<div className="flex flex-col gap-2">
					{data.items.map((item) => (
						<Card
							key={item.id}
							className={`cursor-pointer transition-colors hover:border-primary/40 ${
								item.readAt ? "bg-muted/10" : "bg-card"
							}`}
							onClick={() => openNotification(item.id, item.link)}
						>
							<CardHeader className="flex flex-row items-start gap-3 pb-2">
								<span
									className={`mt-1.5 size-2 shrink-0 rounded-full ${
										item.readAt ? "bg-muted-foreground/30" : "bg-primary"
									}`}
								/>
								<div className="min-w-0 flex-1">
									<CardTitle className="text-sm font-semibold">
										{item.title}
									</CardTitle>
									<p className="mt-1 text-xs text-muted-foreground">
										{item.body}
									</p>
									<p className="mt-1 text-[10px] text-muted-foreground">
										{timeLabel(item.createdAt)}
									</p>
								</div>
								{!item.readAt && (
									<Button
										size="sm"
										variant="ghost"
										onClick={(event) => {
											event.stopPropagation();
											markRead.mutate({ id: item.id });
										}}
										className="h-7 shrink-0 text-[10px]"
									>
										{isIndonesian ? "Tandai" : "Mark read"}
									</Button>
								)}
							</CardHeader>
						</Card>
					))}
				</div>
			)}
		</div>
	);
};

export const Route = createFileRoute("/_authenticated/notifications/")({
	component: NotificationsPage,
});
