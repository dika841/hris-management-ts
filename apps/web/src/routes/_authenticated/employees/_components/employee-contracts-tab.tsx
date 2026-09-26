import { Badge } from "@app/components/ui/badge";
import { Button } from "@app/components/ui/button";
import { Card, CardContent, CardHeader } from "@app/components/ui/card";
import { formatDate, formatRupiah } from "@app/format";
import type { TEmployeeContract } from "@app/schemas";
import { CheckCircle2, Clock, DollarSign, FileText, Info } from "lucide-react";
import type { FC, ReactElement } from "react";
import { useContractCompensationPay, useContractList } from "../_hooks/use-employees.ts";

type TProps = {
	employeeId: string;
};

export const EmployeeContractsTab: FC<TProps> = ({ employeeId }): ReactElement => {
	const { data: contracts } = useContractList(employeeId);
	const payMutation = useContractCompensationPay();

	const handlePayCompensation = (contract: TEmployeeContract) => {
		if (
			window.confirm(
				`Catat pembayaran uang kompensasi PKWT sebesar ${formatRupiah(contract.compensationAmount)} untuk kontrak ${contract.contractNumber}?`,
			)
		) {
			payMutation.mutate({
				contractId: contract.id,
				notes: "Dibayarkan via transfer payroll",
			});
		}
	};

	return (
		<div className="space-y-6">
			{/* Indonesian Labor Law PP 35/2021 Guidance Alert */}
			<div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 text-xs text-blue-900 dark:text-blue-200">
				<div className="flex items-start gap-2.5">
					<Info className="size-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
					<div className="space-y-1">
						<p className="font-semibold">Kepatuhan Regulasi PKWT PP No. 35 Tahun 2021</p>
						<p className="text-muted-foreground leading-relaxed">
							1. Durasi akumulasi PKWT maksimal 5 (lima) tahun secara berkesinambungan.<br />
							2. PKWT dilarang mensyaratkan masa percobaan kerja (probation). Jika disyaratkan, batal demi hukum.<br />
							3. Pengusaha wajib memberikan Uang Kompensasi PKWT saat berakhirnya atau diperpanjangnya kontrak kerja: <span className="font-semibold">(Masa Kerja Bulan / 12) × 1 Bulan Upah</span>.
						</p>
					</div>
				</div>
			</div>

			{/* Contract list */}
			{contracts.length === 0 ? (
				<Card className="border-border/60">
					<CardContent className="py-12 text-center text-xs text-muted-foreground">
						Belum ada riwayat kontrak kerja yang diterbitkan untuk karyawan ini.
					</CardContent>
				</Card>
			) : (
				<div className="space-y-4">
					{contracts.map((c) => {
						const isPkwt = c.contractType === "pkwt";
						return (
							<Card key={c.id} className="border-border/70 overflow-hidden shadow-sm">
								<CardHeader className="bg-muted/20 border-b border-border/40 py-3.5">
									<div className="flex flex-wrap items-center justify-between gap-2">
										<div className="flex items-center gap-2">
											<FileText className="size-4 text-primary" />
											<span className="font-mono text-xs font-bold text-foreground">
												{c.contractNumber}
											</span>
											<Badge variant="outline" className="text-[10px] uppercase font-semibold">
												{c.contractType}
											</Badge>
											<Badge
												variant={c.status === "active" ? "default" : "secondary"}
												className="text-[10px] capitalize font-medium"
											>
												{c.status}
											</Badge>
										</div>
										<div className="text-xs text-muted-foreground">
											Dibuat {formatDate(c.createdAt)}
										</div>
									</div>
								</CardHeader>
								<CardContent className="p-5 space-y-4 text-xs">
									<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
										<div>
											<div className="text-muted-foreground text-[11px]">Tanggal Mulai</div>
											<div className="font-medium text-foreground">{formatDate(c.startDate)}</div>
										</div>
										<div>
											<div className="text-muted-foreground text-[11px]">Tanggal Selesai</div>
											<div className="font-medium text-foreground">
												{c.endDate ? formatDate(c.endDate) : "Tidak terbatas (PKWTT)"}
											</div>
										</div>
										<div>
											<div className="text-muted-foreground text-[11px]">Gaji Pokok & Tunjangan</div>
											<div className="font-mono font-semibold text-foreground">
												{formatRupiah(c.basicSalary)}
												{c.fixedAllowance > 0 && ` + ${formatRupiah(c.fixedAllowance)}`}
											</div>
										</div>
										<div>
											<div className="text-muted-foreground text-[11px]">Departemen & Posisi</div>
											<div className="font-medium text-foreground">
												{c.department} - {c.position}
											</div>
										</div>
									</div>

									{/* Compensation Section for PKWT */}
									{isPkwt && (
										<div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
											<div className="flex items-start gap-2.5">
												<DollarSign className="size-4 text-amber-600 dark:text-amber-400 mt-0.5" />
												<div>
													<div className="font-semibold text-amber-900 dark:text-amber-200">
														Uang Kompensasi PKWT (PP 35/2021)
													</div>
													<div className="text-[11px] text-muted-foreground">
														Hak kompensasi terhitung:{" "}
														<span className="font-mono font-bold text-foreground">
															{formatRupiah(c.compensationAmount)}
														</span>
													</div>
												</div>
											</div>
											<div className="flex items-center gap-2">
												{c.compensationPaid ? (
													<Badge className="bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 border border-emerald-600/20 text-[11px] gap-1">
														<CheckCircle2 className="size-3" />
														Lunas {c.compensationPaidAt ? formatDate(c.compensationPaidAt) : ""}
													</Badge>
												) : (
													<>
														<Badge variant="outline" className="text-amber-700 dark:text-amber-400 border-amber-500/30 text-[11px] gap-1">
															<Clock className="size-3" />
															Belum Dibayar
														</Badge>
														<Button
															size="sm"
															variant="outline"
															onClick={() => handlePayCompensation(c)}
															disabled={payMutation.isPending}
															className="h-7 text-xs font-medium"
														>
															Tandai Telah Dibayar
														</Button>
													</>
												)}
											</div>
										</div>
									)}

									{c.notes && (
										<div className="text-[11px] text-muted-foreground border-t border-border/40 pt-2">
											<span className="font-semibold">Catatan:</span> {c.notes}
										</div>
									)}
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
};
