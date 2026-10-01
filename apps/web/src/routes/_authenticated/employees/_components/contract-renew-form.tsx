import { Button } from "@app/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@app/components/ui/card";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { Textarea } from "@app/components/ui/textarea";
import { formatRupiah } from "@app/format";
import type { TEmployee } from "@app/schemas";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, RefreshCw } from "lucide-react";
import { type FC, type FormEvent, type ReactElement, useState } from "react";
import { useContractList, useContractRenew } from "../_hooks/use-employees.ts";

type TProps = {
	employee: TEmployee;
};

export const ContractRenewForm: FC<TProps> = ({ employee }): ReactElement => {
	const navigate = useNavigate();
	const { data: contracts } = useContractList(employee.id);
	const renewMutation = useContractRenew();

	const activeContract = contracts.find(
		(c) => c.status === "active" && c.contractType === "pkwt",
	);

	const [contractNumber, setContractNumber] = useState(
		`RNW-${employee.employeeCode}-${Date.now().toString().slice(-4)}`,
	);
	const [newStartDate, setNewStartDate] = useState(
		activeContract?.endDate || new Date().toISOString().slice(0, 10),
	);
	const [newEndDate, setNewEndDate] = useState("");
	const [salary, setSalary] = useState(employee.basicSalary);
	const [allowance, setAllowance] = useState(0);
	const [position, setPosition] = useState(employee.position);
	const [department, setDepartment] = useState(employee.department);
	const [notes, setNotes] = useState("");

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!activeContract) return;
		await renewMutation.mutateAsync({
			previousContractId: activeContract.id,
			contractNumber,
			startDate: newStartDate,
			endDate: newEndDate,
			basicSalary: salary,
			fixedAllowance: allowance,
			position,
			department,
			notes: notes || undefined,
		});
		void navigate({
			to: "/employees/$employeeId",
			params: { employeeId: employee.id },
		});
	};

	if (!activeContract) {
		return (
			<Card className="border-border/60">
				<CardContent className="py-8 text-center text-xs text-muted-foreground">
					Karyawan ini tidak memiliki kontrak PKWT aktif yang dapat
					diperpanjang.
				</CardContent>
			</Card>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<Card className="border-border/60 border-amber-500/30">
				<CardHeader className="pb-3 bg-amber-500/5">
					<CardTitle className="text-sm font-semibold text-amber-900 dark:text-amber-200">
						Kompensasi Kontrak Sebelumnya (Pasal 15 Ayat 1 PP 35/2021)
					</CardTitle>
				</CardHeader>
				<CardContent className="pt-4 space-y-3 text-xs">
					<p className="text-muted-foreground leading-relaxed">
						Saat perpanjangan PKWT dilakukan, pengusaha wajib membayarkan uang
						kompensasi untuk masa kerja PKWT yang telah diselesaikan sebelum
						perpanjangan dimulai.
					</p>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 rounded-lg bg-card border border-border/50">
						<div>
							<div className="text-muted-foreground text-[11px]">
								Kontrak Berakhir
							</div>
							<div className="font-mono font-semibold">
								{activeContract.contractNumber}
							</div>
						</div>
						<div>
							<div className="text-muted-foreground text-[11px]">
								Periode Kerja
							</div>
							<div>
								{activeContract.startDate} s.d. {activeContract.endDate}
							</div>
						</div>
						<div>
							<div className="text-muted-foreground text-[11px]">
								Upah Terakhir
							</div>
							<div className="font-mono font-semibold">
								{formatRupiah(activeContract.basicSalary)}
							</div>
						</div>
						<div>
							<div className="text-muted-foreground text-[11px]">
								Uang Kompensasi Wajib
							</div>
							<div className="font-mono font-bold text-amber-700 dark:text-amber-400">
								{formatRupiah(activeContract.compensationAmount)}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className="border-border/60">
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-semibold">
						Ketentuan Kontrak Perpanjangan
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-1.5">
							<Label className="text-xs">Nomor Kontrak Baru</Label>
							<Input
								value={contractNumber}
								onChange={(e) => setContractNumber(e.target.value)}
								placeholder="Nomor SK Perpanjangan"
								required
							/>
						</div>

						<div className="space-y-1.5">
							<Label className="text-xs">Tanggal Mulai Perpanjangan</Label>
							<Input
								type="date"
								value={newStartDate}
								onChange={(e) => setNewStartDate(e.target.value)}
								required
							/>
						</div>

						<div className="space-y-1.5">
							<Label className="text-xs">Tanggal Selesai Perpanjangan</Label>
							<Input
								type="date"
								value={newEndDate}
								onChange={(e) => setNewEndDate(e.target.value)}
								required
							/>
						</div>

						<div className="space-y-1.5">
							<Label className="text-xs">Gaji Pokok Baru (IDR)</Label>
							<Input
								type="number"
								value={salary}
								onChange={(e) => setSalary(Number(e.target.value))}
								required
							/>
						</div>

						<div className="space-y-1.5">
							<Label className="text-xs">Tunjangan Tetap (IDR)</Label>
							<Input
								type="number"
								value={allowance}
								onChange={(e) => setAllowance(Number(e.target.value))}
							/>
						</div>

						<div className="space-y-1.5">
							<Label className="text-xs">Departemen</Label>
							<Input
								value={department}
								onChange={(e) => setDepartment(e.target.value)}
								required
							/>
						</div>

						<div className="space-y-1.5">
							<Label className="text-xs">Jabatan / Posisi</Label>
							<Input
								value={position}
								onChange={(e) => setPosition(e.target.value)}
								required
							/>
						</div>
					</div>

					<div className="space-y-1.5">
						<Label className="text-xs">
							Catatan Evaluasi Kinerja & Perpanjangan
						</Label>
						<Textarea
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder="Evaluasi kinerja memenuhi standar target untuk perpanjangan kontrak..."
						/>
					</div>
				</CardContent>
			</Card>

			<div className="flex items-center justify-end gap-3 pt-2">
				<Button
					type="button"
					variant="outline"
					onClick={() =>
						navigate({
							to: "/employees/$employeeId",
							params: { employeeId: employee.id },
						})
					}
				>
					Batal
				</Button>
				<Button
					type="submit"
					disabled={renewMutation.isPending}
					className="gap-2"
				>
					{renewMutation.isPending ? (
						<Loader2 className="size-4 animate-spin" />
					) : (
						<RefreshCw className="size-4" />
					)}
					{renewMutation.isPending
						? "Memproses..."
						: "Terbitkan Perpanjangan Kontrak"}
				</Button>
			</div>
		</form>
	);
};
