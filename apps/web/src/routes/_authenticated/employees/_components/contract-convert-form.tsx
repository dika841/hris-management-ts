import { Button } from "@app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@app/components/ui/card";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { Textarea } from "@app/components/ui/textarea";
import type { TEmployee } from "@app/schemas";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Loader2, UserCheck } from "lucide-react";
import { type FC, type FormEvent, type ReactElement, useState } from "react";
import { useContractConvert, useContractList } from "../_hooks/use-employees.ts";

type TProps = {
	employee: TEmployee;
};

export const ContractConvertForm: FC<TProps> = ({ employee }): ReactElement => {
	const navigate = useNavigate();
	const { data: contracts } = useContractList(employee.id);
	const convertMutation = useContractConvert();

	const activeContract = contracts.find((c) => c.status === "active" && c.contractType === "pkwt");

	const [contractNumber, setContractNumber] = useState(`SK-TETAP-${employee.employeeCode}-${new Date().getFullYear()}`);
	const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().slice(0, 10));
	const [salary, setSalary] = useState(employee.basicSalary);
	const [allowance, setAllowance] = useState(0);
	const [position, setPosition] = useState(employee.position);
	const [department, setDepartment] = useState(employee.department);
	const [notes, setNotes] = useState("");

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!activeContract) return;
		await convertMutation.mutateAsync({
			previousContractId: activeContract.id,
			contractNumber,
			effectiveDate,
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
					Karyawan ini tidak memiliki kontrak PKWT aktif yang dapat dikonversi ke PKWTT.
				</CardContent>
			</Card>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<Card className="border-border/60 border-emerald-500/30">
				<CardHeader className="pb-3 bg-emerald-500/5">
					<CardTitle className="text-sm font-semibold text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
						<CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
						Kompensasi Pengakhiran Masa PKWT Sebelum Pengangkatan Tetap (PKWTT)
					</CardTitle>
				</CardHeader>
				<CardContent className="pt-4 space-y-3 text-xs">
					<p className="text-muted-foreground leading-relaxed">
						Sesuai Pasal 15 s.d. 17 PP No. 35 Tahun 2021, karyawan kontrak PKWT yang diangkat menjadi karyawan tetap (PKWTT) berhak atas Uang Kompensasi PKWT untuk masa kerja yang telah dijalani hingga tanggal efektif pengangkatan.
					</p>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 rounded-lg bg-card border border-border/50">
						<div>
							<div className="text-muted-foreground text-[11px]">Kontrak Asal</div>
							<div className="font-mono font-semibold">{activeContract.contractNumber}</div>
						</div>
						<div>
							<div className="text-muted-foreground text-[11px]">Mulai PKWT</div>
							<div>{activeContract.startDate}</div>
						</div>
						<div>
							<div className="text-muted-foreground text-[11px]">Tanggal Pengangkatan</div>
							<div className="font-semibold text-foreground">{effectiveDate}</div>
						</div>
						<div>
							<div className="text-muted-foreground text-[11px]">Status Karyawan Baru</div>
							<div className="font-semibold text-emerald-600 dark:text-emerald-400">Karyawan Tetap (PKWTT)</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className="border-border/60">
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-semibold">SK Pengangkatan & Ketentuan Gaji Tetap</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-1.5">
							<Label className="text-xs">Nomor Surat Keputusan (SK) Pengangkatan</Label>
							<Input
								value={contractNumber}
								onChange={(e) => setContractNumber(e.target.value)}
								placeholder="Nomor SK Direksi"
								required
							/>
						</div>

						<div className="space-y-1.5">
							<Label className="text-xs">Tanggal Efektif Pengangkatan Tetap</Label>
							<Input
								type="date"
								value={effectiveDate}
								onChange={(e) => setEffectiveDate(e.target.value)}
								required
							/>
						</div>

						<div className="space-y-1.5">
							<Label className="text-xs">Gaji Pokok Karyawan Tetap (IDR)</Label>
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
							<Label className="text-xs">Jabatan / Posisi Tetap</Label>
							<Input
								value={position}
								onChange={(e) => setPosition(e.target.value)}
								required
							/>
						</div>
					</div>

					<div className="space-y-1.5">
						<Label className="text-xs">Catatan & Keputusan Direksi</Label>
						<Textarea
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder="Berdasarkan hasil uji kompetensi dan rekomendasi pimpinan divisi..."
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
				<Button type="submit" disabled={convertMutation.isPending} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
					{convertMutation.isPending ? (
						<Loader2 className="size-4 animate-spin" />
					) : (
						<UserCheck className="size-4" />
					)}
					{convertMutation.isPending ? "Memproses..." : "Angkat Menjadi Karyawan Tetap"}
				</Button>
			</div>
		</form>
	);
};
