import { Badge } from "@app/components/ui/badge";
import type { TAttendanceStatus, TLeaveRequestStatus } from "@app/schemas";
import type { FC, ReactElement } from "react";

export const AttendanceStatusBadge: FC<{ status: TAttendanceStatus }> = ({
	status,
}): ReactElement => {
	switch (status) {
		case "present":
			return (
				<Badge
					variant="outline"
					className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
				>
					Hadir (Present)
				</Badge>
			);
		case "absent":
			return (
				<Badge
					variant="outline"
					className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
				>
					Mangkir (Alpha)
				</Badge>
			);
		case "sick":
			return (
				<Badge
					variant="outline"
					className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
				>
					Sakit
				</Badge>
			);
		case "leave":
			return (
				<Badge
					variant="outline"
					className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
				>
					Cuti
				</Badge>
			);
		case "permitted":
			return (
				<Badge
					variant="outline"
					className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20"
				>
					Izin Resmi
				</Badge>
			);
		case "holiday":
			return (
				<Badge
					variant="outline"
					className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
				>
					Libur Resmi
				</Badge>
			);
		case "off":
			return (
				<Badge
					variant="outline"
					className="bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
				>
					Off / Libur Mingguan
				</Badge>
			);
		default:
			return <Badge variant="secondary">{status}</Badge>;
	}
};

export const LeaveStatusBadge: FC<{ status: TLeaveRequestStatus }> = ({
	status,
}): ReactElement => {
	switch (status) {
		case "approved":
			return (
				<Badge
					variant="outline"
					className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
				>
					Disetujui
				</Badge>
			);
		case "pending":
			return (
				<Badge
					variant="outline"
					className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
				>
					Menunggu Approval
				</Badge>
			);
		case "rejected":
			return (
				<Badge
					variant="outline"
					className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
				>
					Ditolak
				</Badge>
			);
		case "cancelled":
			return (
				<Badge
					variant="outline"
					className="bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
				>
					Dibatalkan
				</Badge>
			);
		default:
			return <Badge variant="secondary">{status}</Badge>;
	}
};

export const OvertimeStatusBadge: FC<{ status: string }> = ({
	status,
}): ReactElement => {
	switch (status) {
		case "approved":
			return (
				<Badge
					variant="outline"
					className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
				>
					Disetujui
				</Badge>
			);
		case "pending":
			return (
				<Badge
					variant="outline"
					className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
				>
					Menunggu Persetujuan
				</Badge>
			);
		case "rejected":
			return (
				<Badge
					variant="outline"
					className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
				>
					Ditolak
				</Badge>
			);
		default:
			return <Badge variant="secondary">{status}</Badge>;
	}
};
