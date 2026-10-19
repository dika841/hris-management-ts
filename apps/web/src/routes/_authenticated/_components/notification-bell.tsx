import { Button } from "@app/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@app/components/ui/dropdown-menu";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, CheckCheck } from "lucide-react";
import type { FC, ReactElement } from "react";
import { useI18n } from "#/libs/i18n/index.ts";
import {
	useNotificationMarkAllRead,
	useNotificationMarkRead,
	useNotificationRecent,
	useNotificationUnreadCount,
} from "#/routes/_authenticated/_hooks/use-notifications.ts";

const timeLabel = (value: string): string =>
	new Intl.DateTimeFormat("id-ID", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));

export const NotificationBell: FC = (): ReactElement => {
	const { isIndonesian } = useI18n();
	const navigate = useNavigate();
	const { data: unread } = useNotificationUnreadCount();
	const { data: recent } = useNotificationRecent();
	const markRead = useNotificationMarkRead();
	const markAllRead = useNotificationMarkAllRead();
	const count = unread?.count ?? 0;

	const openNotification = (id: string, link: string | null): void => {
		markRead.mutate({ id });
		if (link) {
			void navigate({ href: link });
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon-sm"
					className="relative"
					aria-label={isIndonesian ? "Notifikasi" : "Notifications"}
				>
					<Bell className="size-4" />
					{count > 0 && (
						<span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold leading-4 text-white">
							{count > 99 ? "99+" : count}
						</span>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-80">
				<div className="flex items-center justify-between gap-2 px-2 py-1.5">
					<DropdownMenuLabel className="p-0 text-xs font-semibold">
						{isIndonesian ? "Notifikasi" : "Notifications"}
					</DropdownMenuLabel>
					{count > 0 && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => markAllRead.mutate(undefined)}
							disabled={markAllRead.isPending}
							className="h-6 gap-1 px-1.5 text-[10px]"
						>
							<CheckCheck className="size-3" />
							{isIndonesian ? "Tandai semua" : "Mark all"}
						</Button>
					)}
				</div>
				<DropdownMenuSeparator />
				{recent?.items.length === 0 ? (
					<p className="px-3 py-6 text-center text-xs text-muted-foreground">
						{isIndonesian ? "Belum ada notifikasi." : "No notifications yet."}
					</p>
				) : (
					recent?.items.map((item) => (
						<DropdownMenuItem
							key={item.id}
							onSelect={() => openNotification(item.id, item.link)}
							className="flex cursor-pointer flex-col items-start gap-1 py-2"
						>
							<div className="flex w-full items-start gap-2">
								<span
									className={`mt-1 size-1.5 shrink-0 rounded-full ${
										item.readAt ? "bg-muted-foreground/30" : "bg-primary"
									}`}
								/>
								<div className="min-w-0 flex-1">
									<div className="truncate text-xs font-medium">
										{item.title}
									</div>
									<div className="line-clamp-2 text-[11px] text-muted-foreground">
										{item.body}
									</div>
									<div className="mt-0.5 text-[10px] text-muted-foreground">
										{timeLabel(item.createdAt)}
									</div>
								</div>
							</div>
						</DropdownMenuItem>
					))
				)}
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild className="justify-center text-xs">
					<Link to="/notifications">
						{isIndonesian ? "Lihat semua notifikasi" : "View all notifications"}
					</Link>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
