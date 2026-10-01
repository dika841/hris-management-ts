import { Guard } from "@app/components/guard/guard";
import { Button } from "@app/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@app/components/ui/table";
import { PERMISSION } from "@app/permissions";
import type { TLeaveRequest, TLeaveRequestList } from "@app/schemas";
import { Calendar, Check, FileText, User, X } from "lucide-react";
import type { FC, ReactElement } from "react";
import {
	useLeaveRequestApprove,
	useLeaveRequestReject,
} from "#/routes/_authenticated/attendance/_hooks/use-attendance.ts";
import { LeaveStatusBadge } from "./attendance-status-badge.tsx";

type TLeaveRequestTableProps = {
	list: TLeaveRequestList;
};

export const LeaveRequestTable: FC<TLeaveRequestTableProps> = ({
	list,
}): ReactElement => {
	const approveMutation = useLeaveRequestApprove();
	const rejectMutation = useLeaveRequestReject();

	const handleApprove = (id: string) => {
		approveMutation.mutate({ id });
	};

	const handleReject = (id: string) => {
		rejectMutation.mutate({ id, rejectionReason: "Ditolak oleh HR / Atasan" });
	};

	const isProcessing = approveMutation.isPending || rejectMutation.isPending;

	return (
		<div className="rounded-lg border border-border/60 bg-card overflow-hidden">
			<Table>
				<TableHeader>
					<TableRow className="border-b border-border/40 bg-muted/30">
						<TableHead className="text-xs font-semibold">
							Karyawan (ID)
						</TableHead>
						<TableHead className="text-xs font-semibold">
							Jenis Cuti / Izin
						</TableHead>
						<TableHead className="text-xs font-semibold">
							Rentang Waktu
						</TableHead>
						<TableHead className="text-xs font-semibold text-center">
							Durasi
						</TableHead>
						<TableHead className="text-xs font-semibold">Alasan</TableHead>
						<TableHead className="text-xs font-semibold text-center">
							Surat Dokter
						</TableHead>
						<TableHead className="text-xs font-semibold text-center">
							Status
						</TableHead>
						<TableHead className="text-xs font-semibold text-right w-36">
							Aksi
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{list.items.length === 0 ? (
						<TableRow>
							<TableCell
								colSpan={8}
								className="py-10 text-center text-xs text-muted-foreground"
							>
								Belum ada pengajuan cuti. Klik "Ajukan Cuti Baru" untuk membuat
								permohonan.
							</TableCell>
						</TableRow>
					) : (
						list.items.map((req: TLeaveRequest) => (
							<TableRow
								key={req.id}
								className="border-b border-border/30 hover:bg-muted/20"
							>
								<TableCell>
									<div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
										<User className="size-3.5 text-muted-foreground" />
										{req.employeeId.slice(0, 8)}...
									</div>
								</TableCell>
								<TableCell>
									<div className="text-xs font-medium text-foreground">
										{req.leaveTypeName ?? req.leaveTypeId.slice(0, 8)}
									</div>
								</TableCell>
								<TableCell className="font-mono text-xs text-muted-foreground">
									<div className="flex items-center gap-1">
										<Calendar className="size-3" />
										{req.startDate} s/d {req.endDate}
									</div>
								</TableCell>
								<TableCell className="text-center font-mono text-xs font-semibold text-foreground">
									{req.totalDays} hari
								</TableCell>
								<TableCell className="text-xs text-muted-foreground max-w-xs truncate">
									{req.reason ?? "-"}
								</TableCell>
								<TableCell className="text-center">
									{req.doctorNoteUrl ? (
										<span className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
											<FileText className="size-3" />
											Ada Surat
										</span>
									) : (
										<span className="text-xs text-muted-foreground">-</span>
									)}
								</TableCell>
								<TableCell className="text-center">
									<LeaveStatusBadge status={req.status} />
								</TableCell>
								<TableCell className="text-right">
									{req.status === "pending" ? (
										<Guard permissions={[PERMISSION.LEAVE_APPROVE]}>
											<div className="flex items-center justify-end gap-1.5">
												<Button
													size="sm"
													variant="outline"
													disabled={isProcessing}
													onClick={() => handleApprove(req.id)}
													className="h-7 px-2 text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 gap-1"
												>
													<Check className="size-3" />
													Setujui
												</Button>
												<Button
													size="sm"
													variant="outline"
													disabled={isProcessing}
													onClick={() => handleReject(req.id)}
													className="h-7 px-2 text-xs border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 gap-1"
												>
													<X className="size-3" />
													Tolak
												</Button>
											</div>
										</Guard>
									) : (
										<span className="text-xs text-muted-foreground">-</span>
									)}
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	);
};
