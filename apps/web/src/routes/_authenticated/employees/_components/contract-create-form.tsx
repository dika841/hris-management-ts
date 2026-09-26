import { Button } from "@app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@app/components/ui/card";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@app/components/ui/select";
import { Textarea } from "@app/components/ui/textarea";
import { formatRupiah } from "@app/format";
import {
	CONTRACT_TYPE,
	type TContractType,
	type TEmployee,
} from "@app/schemas";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, Calculator, FileCheck, Loader2 } from "lucide-react";
import { type FC, type FormEvent, type ReactElement, useState } from "react";
import { useContractCreate } from "../_hooks/use-employees.ts";

type TProps = {
	employee: TEmployee;
};

export const ContractCreateForm: FC<TProps> = ({ employee }): ReactElement => {
	const navigate = useNavigate();
	const createMutation = useContractCreate();

	const [contractType, setContractType] = useState<TContractType>(CONTRACT_TYPE.PKWT);
	const [contractNumber, setContractNumber] = useState(`CTR-${employee.employeeCode}-${Date.now().toString().slice(-4)}`);
	const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
	const [endDate, setEndDate] = useState("");
	const [probationEndDate, setProbationEndDate] = useState("");
	const [salary, setSalary] = useState(employee.basicSalary);
	const [allowance, setAllowance] = useState(0);
	const [department, setDepartment] = useState(employee.department);
	const [position, setPosition] = useState(employee.position);
	const [notes, setNotes] = useState("");

	const calculateEstimatedCompensation = (): number => {
		if (contractType !== CONTRACT_TYPE.PKWT || !startDate || !endDate) return 0;
		const diffMs = new Date(endDate).getTime() - new Date(startDate).getTime();
		if (diffMs <= 0) return 0;
		const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
		const months = days / 30;
		if (months < 1) return 0;
		return Math.round((months / 12) * (salary + allowance));
	};

	const estimatedCompensation = calculateEstimatedCompensation();

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		await createMutation.mutateAsync({
			employeeId: employee.id,
			contractType,
			contractNumber,
			startDate,
			endDate: contractType === CONTRACT_TYPE.PKWT ? endDate : undefined,
			probationEndDate: contractType === CONTRACT_TYPE.PKWTT && probationEndDate ? probationEndDate : undefined,
			basicSalary: salary,
			fixedAllowance: allowance,
			department,
			position,
			notes: notes || undefined,
		});
		void navigate({
			to: "/employees/$employeeId",
			params: { employeeId: employee.id },
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<Card className="border-border/60">
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-semibold">Tipe & Nomor Perjanjian Kerja</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-1.5">
							<Label className="text-xs">Tipe Perjanjian Kerja</Label>
							<Select
								value={contractType}
								onValueChange={(val) => setContractType(val as TContractType)}
							>
								<SelectTrigger>
									<SelectValue placeholder="Pilih Tipe Kontrak" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={CONTRACT_TYPE.PKWT}>
										PKWT (Perjanjian Kerja Waktu Tertentu / Kontrak)
									</SelectItem>
									<SelectItem value={CONTRACT_TYPE.PKWTT}>
										PKWTT (Perjanjian Kerja Waktu Tidak Tertentu / Tetap)
									</SelectItem>
									<SelectItem value={CONTRACT_TYPE.INTERNSHIP}>
										Magang / Internship
									</SelectItem>
									<SelectItem value={CONTRACT_TYPE.FREELANCE}>
										Freelance / Pekerja Lepas
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-1.5">
							<Label className="text-xs">Nomor Dokumen Kontrak</Label>
							<Input
								value={contractNumber}
								onChange={(e) => setContractNumber(e.target.value)}
								placeholder="Contoh: 001/HR-PKWT/X/2026"
								required
							/>
						</div>
					</div>

					{contractType === CONTRACT_TYPE.PKWT && (
						<div className="rounded-md border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2">
							<AlertCircle className="size-4 shrink-0 mt-0.5" />
							<span>
								<strong>Peringatan PP 35/2021:</strong> Masa percobaan (probation) dilarang dalam PKWT. Jika disyaratkan dalam klausul, demi hukum masa percobaan batal dan masa kerja dihitung sejak awal.
							</span>
						</div>
					)}
				</CardContent>
			</Card>

			<Card className="border-border/60">
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-semibold">Masa Berlaku & Remunerasi</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-1.5">
							<Label className="text-xs">Tanggal Mulai Berlaku</Label>
							<Input
								type="date"
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
								required
							/>
						</div>

						{contractType === CONTRACT_TYPE.PKWT ? (
							<div className="space-y-1.5">
								<Label className="text-xs">Tanggal Berakhir Kontrak</Label>
								<Input
									type="date"
									value={endDate}
									onChange={(e) => setEndDate(e.target.value)}
									required
								/>
							</div>
						) : (
							<div className="space-y-1.5">
								<Label className="text-xs">Batas Masa Percobaan (Opsional, Maks. 3 Bulan)</Label>
								<Input
									type="date"
									value={probationEndDate}
									onChange={(e) => setProbationEndDate(e.target.value)}
								/>
							</div>
						)}

						<div className="space-y-1.5">
							<Label className="text-xs">Gaji Pokok Bulanan (IDR)</Label>
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
					</div>

					{contractType === CONTRACT_TYPE.PKWT && (
						<div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center justify-between">
							<div className="flex items-center gap-2.5">
								<Calculator className="size-4 text-emerald-600 dark:text-emerald-400" />
								<div>
									<div className="text-xs font-semibold text-emerald-950 dark:text-emerald-200">
										Estimasi Hak Uang Kompensasi PKWT (PP 35/2021)
									</div>
									<div className="text-[11px] text-muted-foreground">
										Rumus: (Masa Kerja Bulan / 12) × Upah Pokok & Tunjangan Tetap
									</div>
								</div>
							</div>
							<div className="text-right">
								<div className="font-mono text-base font-bold text-emerald-700 dark:text-emerald-400">
									{formatRupiah(estimatedCompensation)}
								</div>
								<div className="text-[10px] text-muted-foreground">
									Wajib dibayarkan saat berakhirnya kontrak
								</div>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			<Card className="border-border/60">
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-semibold">Penugasan & Catatan Tambahan</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-1.5">
							<Label className="text-xs">Departemen</Label>
							<Input
								value={department}
								onChange={(e) => setDepartment(e.target.value)}
								required
							/>
						</div>

						<div className="space-y-1.5">
							<Label className="text-xs">Posisi / Jabatan</Label>
							<Input
								value={position}
								onChange={(e) => setPosition(e.target.value)}
								required
							/>
						</div>
					</div>

					<div className="space-y-1.5">
						<Label className="text-xs">Catatan & Ketentuan Khusus</Label>
						<Textarea
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder="Contoh: Perjanjian kerja untuk proyek implementasi ERP fase 1..."
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
				<Button type="submit" disabled={createMutation.isPending} className="gap-2">
					{createMutation.isPending ? (
						<Loader2 className="size-4 animate-spin" />
					) : (
						<FileCheck className="size-4" />
					)}
					{createMutation.isPending ? "Menyimpan..." : "Terbitkan Kontrak Kerja"}
				</Button>
			</div>
		</form>
	);
};
