import { Guard } from "@app/components/guard/guard";
import { Badge } from "@app/components/ui/badge";
import { Button } from "@app/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@app/components/ui/table";
import { formatRupiah } from "@app/format";
import { PERMISSION } from "@app/permissions";
import type { TOvertimeRequest, TOvertimeList } from "@app/schemas";
import { AlertTriangle, Check, Clock, User, X } from "lucide-react";
import type { FC, ReactElement } from "react";
import {
	useOvertimeApprove,
	useOvertimeReject,
} from "#/routes/_authenticated/attendance/_hooks/use-attendance.ts";
import { OvertimeStatusBadge } from "./attendance-status-badge.tsx";

type TOvertimeTableProps = {
	list: TOvertimeList;
};

export const OvertimeTable: FC<TOvertimeTableProps> = ({
	list,
}): ReactElement => {
	const approveMutation = useOvertimeApprove();
	const rejectMutation = useOvertimeReject();

	const handleApprove = (id: string) => {
		approveMutation.mutate({ id });
	};

	const handleReject = (id: string) => {
		rejectMutation.mutate({
			id,
			rejectionReason: "Ditolak oleh atasan/manajemen",
		});
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
						<TableHead className="text-xs font-semibold">Tanggal</TableHead>
						<TableHead className="text-xs font-semibold">
							Waktu Lembur
						</TableHead>
						<TableHead className="text-xs font-semibold text-center">
							Durasi
						</TableHead>
						<TableHead className="text-xs font-semibold">Jenis Hari</TableHead>
						<TableHead className="text-xs font-semibold text-right">
							Upah Lembur (Est)
						</TableHead>
						<TableHead className="text-xs font-semibold text-center">
							Kepatuhan PP 35/2021
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
								colSpan={9}
								className="py-10 text-center text-xs text-muted-foreground"
							>
								Belum ada Surat Perintah Lembur (SPL). Klik "Buat SPL Lembur
								Baru" untuk mengajukan lembur.
							</TableCell>
						</TableRow>
					) : (
						list.items.map((ot: TOvertimeRequest) => {
							const hasWarning =
								ot.durationMinutes > 240 || ot.notes?.includes("⚠️");
							return (
								<TableRow
									key={ot.id}
									className="border-b border-border/30 hover:bg-muted/20"
								>
									<TableCell>
										<div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
											<User className="size-3.5 text-muted-foreground" />
											{ot.employeeId.slice(0, 8)}...
										</div>
									</TableCell>
									<TableCell className="font-mono text-xs text-foreground">
										{ot.overtimeDate}
									</TableCell>
									<TableCell className="font-mono text-xs text-muted-foreground">
										<div className="flex items-center gap-1">
											<Clock className="size-3 text-muted-foreground" />
											{ot.startTime} - {ot.endTime}
										</div>
									</TableCell>
									<TableCell className="text-center font-mono text-xs font-semibold text-foreground">
										{(ot.durationMinutes / 60).toFixed(1)} jam
									</TableCell>
									<TableCell className="text-xs">
										<Badge variant="outline" className="text-[10px]">
											{ot.dayType === "workday"
												? "Hari Kerja"
												: ot.dayType === "weekly_off"
													? "Libur Mingguan"
													: "Libur Nasional"}
										</Badge>
									</TableCell>
									<TableCell className="text-right font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
										{formatRupiah(ot.calculatedAmount)}
									</TableCell>
									<TableCell className="text-center">
										{hasWarning ? (
											<span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
												<AlertTriangle className="size-3" />
												&gt;4 Jam (Flagged)
											</span>
										) : (
											<span className="inline-flex items-center text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
												Sesuai Regulasi
											</span>
										)}
									</TableCell>
									<TableCell className="text-center">
										<OvertimeStatusBadge status={ot.status} />
									</TableCell>
									<TableCell className="text-right">
										{ot.status === "pending" ? (
											<Guard permissions={[PERMISSION.OVERTIME_APPROVE]}>
												<div className="flex items-center justify-end gap-1.5">
													<Button
														size="sm"
														variant="outline"
														disabled={isProcessing}
														onClick={() => handleApprove(ot.id)}
														className="h-7 px-2 text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 gap-1"
													>
														<Check className="size-3" />
														Setujui
													</Button>
													<Button
														size="sm"
														variant="outline"
														disabled={isProcessing}
														onClick={() => handleReject(ot.id)}
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
							);
						})
					)}
				</TableBody>
			</Table>
		</div>
	);
};
