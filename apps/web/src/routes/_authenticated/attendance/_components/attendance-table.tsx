import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@app/components/ui/table";
import type { TAttendanceLog, TAttendanceList } from "@app/schemas";
import { Clock, User } from "lucide-react";
import type { FC, ReactElement } from "react";
import { AttendanceStatusBadge } from "./attendance-status-badge.tsx";

type TAttendanceTableProps = {
	list: TAttendanceList;
};

export const AttendanceTable: FC<TAttendanceTableProps> = ({
	list,
}): ReactElement => {
	return (
		<div className="rounded-lg border border-border/60 bg-card overflow-hidden">
			<Table>
				<TableHeader>
					<TableRow className="border-b border-border/40 bg-muted/30">
						<TableHead className="text-xs font-semibold">Tanggal</TableHead>
						<TableHead className="text-xs font-semibold">
							Karyawan (ID)
						</TableHead>
						<TableHead className="text-xs font-semibold">
							Status Kehadiran
						</TableHead>
						<TableHead className="text-xs font-semibold">Jam Masuk</TableHead>
						<TableHead className="text-xs font-semibold">Jam Keluar</TableHead>
						<TableHead className="text-xs font-semibold text-center">
							Durasi Kerja Efektif
						</TableHead>
						<TableHead className="text-xs font-semibold text-center">
							Keterlambatan
						</TableHead>
						<TableHead className="text-xs font-semibold">Catatan</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{list.items.length === 0 ? (
						<TableRow>
							<TableCell
								colSpan={8}
								className="py-10 text-center text-xs text-muted-foreground"
							>
								Belum ada catatan presensi. Klik "Catat Presensi Baru" untuk
								menambahkan data kehadiran harian.
							</TableCell>
						</TableRow>
					) : (
						list.items.map((log: TAttendanceLog) => (
							<TableRow
								key={log.id}
								className="border-b border-border/30 hover:bg-muted/20"
							>
								<TableCell className="font-mono text-xs text-foreground font-medium">
									{log.attendanceDate}
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
										<User className="size-3.5 text-muted-foreground" />
										{log.employeeId.slice(0, 8)}...
									</div>
								</TableCell>
								<TableCell>
									<AttendanceStatusBadge status={log.status} />
								</TableCell>
								<TableCell className="font-mono text-xs text-foreground">
									{log.checkIn ? (
										<span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
											<Clock className="size-3" />
											{log.checkIn}
										</span>
									) : (
										"-"
									)}
								</TableCell>
								<TableCell className="font-mono text-xs text-foreground">
									{log.checkOut ? (
										<span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
											<Clock className="size-3" />
											{log.checkOut}
										</span>
									) : (
										"-"
									)}
								</TableCell>
								<TableCell className="text-center font-mono text-xs">
									{log.effectiveWorkMinutes > 0
										? `${(log.effectiveWorkMinutes / 60).toFixed(1)} jam`
										: "-"}
								</TableCell>
								<TableCell className="text-center font-mono text-xs">
									{log.lateMinutes > 0 ? (
										<span className="text-rose-500 font-semibold">
											+{log.lateMinutes} mnt
										</span>
									) : (
										<span className="text-emerald-500">-</span>
									)}
								</TableCell>
								<TableCell className="text-xs text-muted-foreground max-w-xs truncate">
									{log.notes || (log.isHoliday ? log.holidayName : "-")}
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	);
};
