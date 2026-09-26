import { Button } from "@app/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@app/components/ui/card";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { APP_MESSAGE } from "@app/messages";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, Calendar, CalendarPlus, Loader2 } from "lucide-react";
import { useState, type FC, type FormEvent, type ReactElement } from "react";
import { usePayrollPeriodCreate } from "#/routes/_authenticated/payroll/_hooks/use-payroll.ts";

export const PayrollPeriodCreateForm: FC = (): ReactElement => {
	const navigate = useNavigate();
	const createMutation = usePayrollPeriodCreate();

	const [name, setName] = useState("Oktober 2026");
	const [month, setMonth] = useState(10);
	const [year, setYear] = useState(2026);
	const [startDate, setStartDate] = useState("2026-10-01");
	const [endDate, setEndDate] = useState("2026-10-31");
	const [payDate, setPayDate] = useState("2026-10-28");

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		createMutation.mutate(
			{
				name,
				month,
				year,
				startDate,
				endDate,
				payDate,
			},
			{
				onSuccess: () => {
					void navigate({ to: "/payroll" });
				},
			},
		);
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-6">
			{/* 1. Parameter Siklus */}
			<Card className="border border-border/60 shadow-xs">
				<CardHeader className="pb-4">
					<div className="flex items-center gap-2">
						<div className="flex size-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
							<Calendar className="size-4" />
						</div>
						<div>
							<CardTitle className="text-base font-semibold">
								1. Informasi Siklus Penggajian
							</CardTitle>
							<CardDescription className="text-xs">
								Identitas nama periode, bulan, dan tahun fiskal berjalan
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-1.5 sm:col-span-2">
						<Label htmlFor="periodName" className="text-xs font-medium">
							Nama Periode Penggajian{" "}
							<span className="text-destructive">*</span>
						</Label>
						<Input
							id="periodName"
							required
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Oktober 2026"
							className="text-xs"
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="periodMonth" className="text-xs font-medium">
							Bulan Pembayaran (1 - 12){" "}
							<span className="text-destructive">*</span>
						</Label>
						<Input
							id="periodMonth"
							required
							type="number"
							min={1}
							max={12}
							value={month}
							onChange={(e) => setMonth(Number(e.target.value))}
							className="font-mono text-xs"
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="periodYear" className="text-xs font-medium">
							Tahun Fiskal <span className="text-destructive">*</span>
						</Label>
						<Input
							id="periodYear"
							required
							type="number"
							min={2020}
							max={2100}
							value={year}
							onChange={(e) => setYear(Number(e.target.value))}
							className="font-mono text-xs"
						/>
					</div>
				</CardContent>
			</Card>

			{/* 2. Jadwal Cut-Off & Tanggal Pembayaran */}
			<Card className="border border-border/60 shadow-xs">
				<CardHeader className="pb-4">
					<div className="flex items-center gap-2">
						<div className="flex size-7 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
							<CalendarPlus className="size-4" />
						</div>
						<div>
							<CardTitle className="text-base font-semibold">
								2. Rentang Cut-Off Kehadiran &amp; Tanggal Transfer
							</CardTitle>
							<CardDescription className="text-xs">
								Batas waktu rekapitulasi absensi/lembur dan tanggal dana
								ditransfer ke rekening pegawai
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-1.5">
						<Label htmlFor="startDate" className="text-xs font-medium">
							Awal Periode Cut-Off <span className="text-destructive">*</span>
						</Label>
						<Input
							id="startDate"
							required
							type="date"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
							className="text-xs"
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="endDate" className="text-xs font-medium">
							Akhir Periode Cut-Off <span className="text-destructive">*</span>
						</Label>
						<Input
							id="endDate"
							required
							type="date"
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
							className="text-xs"
						/>
					</div>

					<div className="space-y-1.5 sm:col-span-2">
						<Label htmlFor="payDate" className="text-xs font-medium">
							Tanggal Pencairan Gaji (Pay Date / Transfer Date){" "}
							<span className="text-destructive">*</span>
						</Label>
						<Input
							id="payDate"
							required
							type="date"
							value={payDate}
							onChange={(e) => setPayDate(e.target.value)}
							className="text-xs"
						/>
					</div>
				</CardContent>
			</Card>

			{/* Desember Rekonsiliasi Warning */}
			{month === 12 && (
				<div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
					<AlertCircle className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
					<div className="space-y-1">
						<p className="font-semibold text-xs">
							Otomasi Rekonsiliasi PPh 21 Tahunan (Pasal 17 UU HPP)
						</p>
						<p className="text-[11px] leading-relaxed opacity-90">
							Karena periode ini berada di bulan 12 (Desember), sistem otomatis
							menghitung ulang seluruh penghasilan kumulatif tahun berjalan,
							memotong selisih kurang/lebih bayar pajak, dan menerbitkan Bukti
							Potong 1721-A1 siap lapor SPT.
						</p>
					</div>
				</div>
			)}

			{/* Actions */}
			<div className="flex items-center justify-end gap-3 pt-2">
				<Button variant="outline" asChild className="text-xs">
					<Link to="/payroll">{APP_MESSAGE.CANCEL}</Link>
				</Button>
				<Button
					type="submit"
					disabled={createMutation.isPending}
					className="text-xs font-semibold gap-1.5 min-w-36"
				>
					{createMutation.isPending ? (
						<>
							<Loader2 className="size-3.5 animate-spin" />
							Membuka Periode…
						</>
					) : (
						<>
							<CalendarPlus className="size-3.5" />
							Buka Siklus Penggajian
						</>
					)}
				</Button>
			</div>
		</form>
	);
};
