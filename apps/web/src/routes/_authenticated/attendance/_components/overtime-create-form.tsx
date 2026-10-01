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
	OVERTIME_DAY_TYPE,
	type TOvertimeDayType,
	type TWorkScheduleType,
	WORK_SCHEDULE_TYPE,
} from "@app/schemas";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
	Calculator,
	Clock,
	Coins,
	FileText,
	Loader2,
	Send,
	ShieldAlert,
	User,
} from "lucide-react";
import {
	useEffect,
	useState,
	type FC,
	type FormEvent,
	type ReactElement,
} from "react";
import { orpc } from "#/libs/orpc/client.ts";
import { suspenseQueryOptionsFor } from "#/libs/orpc/procedure-query.ts";
import {
	useOvertimeCalculate,
	useOvertimeCreate,
} from "#/routes/_authenticated/attendance/_hooks/use-attendance.ts";

export const OvertimeCreateForm: FC = (): ReactElement => {
	const navigate = useNavigate();
	const createMutation = useOvertimeCreate();
	const calculateMutation = useOvertimeCalculate();

	const employeesQuery = useSuspenseQuery(
		suspenseQueryOptionsFor(orpc.employee.list, { page: 1, pageSize: 100 }),
	);
	const employees = employeesQuery.data.items;

	const today = new Date().toISOString().split("T")[0] ?? "2026-10-01";
	const [employeeId, setEmployeeId] = useState(employees[0]?.id ?? "");
	const [overtimeDate, setOvertimeDate] = useState(today);
	const [startTime, setStartTime] = useState("17:30");
	const [endTime, setEndTime] = useState("20:30");
	const [dayType, setDayType] = useState<TOvertimeDayType>(
		OVERTIME_DAY_TYPE.WORKDAY,
	);
	const [workScheduleType, setWorkScheduleType] = useState<TWorkScheduleType>(
		WORK_SCHEDULE_TYPE.FIVE_DAYS,
	);
	const [reason, setReason] = useState("");

	// Trigger preview calculation when parameters change
	useEffect(() => {
		if (employeeId && overtimeDate && startTime && endTime) {
			calculateMutation.mutate({
				employeeId,
				overtimeDate,
				startTime,
				endTime,
				dayType,
				workScheduleType,
			});
		}
	}, [employeeId, overtimeDate, startTime, endTime, dayType, workScheduleType]);

	const calc = calculateMutation.data;

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		createMutation.mutate(
			{
				employeeId,
				overtimeDate,
				startTime,
				endTime,
				dayType,
				workScheduleType,
				reason,
			},
			{
				onSuccess: () => {
					void navigate({ to: "/attendance" });
				},
			},
		);
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-6">
			{/* 1. Karyawan & Penjadwalan Lembur */}
			<Card className="border border-border/60 shadow-xs">
				<CardHeader className="pb-4">
					<div className="flex items-center gap-2">
						<div className="flex size-7 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
							<User className="size-4" />
						</div>
						<div>
							<CardTitle className="text-base font-semibold">
								1. Informasi Penugasan Lembur (SPL)
							</CardTitle>
							<CardDescription className="text-xs">
								Identitas karyawan dan jadwal pelaksanaan kerja lembur
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-1.5 sm:col-span-2">
						<Label htmlFor="employeeSelect" className="text-xs font-medium">
							Karyawan Yang Ditugaskan{" "}
							<span className="text-destructive">*</span>
						</Label>
						<Select value={employeeId} onValueChange={setEmployeeId}>
							<SelectTrigger id="employeeSelect" className="text-xs">
								<SelectValue placeholder="Pilih karyawan..." />
							</SelectTrigger>
							<SelectContent>
								{employees.map((emp) => (
									<SelectItem key={emp.id} value={emp.id}>
										{emp.fullName} ({emp.employeeCode}) - {emp.department}{" "}
										(Gaji: {formatRupiah(emp.basicSalary)})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="overtimeDate" className="text-xs font-medium">
							Tanggal Lembur <span className="text-destructive">*</span>
						</Label>
						<Input
							id="overtimeDate"
							type="date"
							required
							value={overtimeDate}
							onChange={(e) => setOvertimeDate(e.target.value)}
							className="text-xs font-mono"
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="dayType" className="text-xs font-medium">
							Jenis Hari <span className="text-destructive">*</span>
						</Label>
						<Select
							value={dayType}
							onValueChange={(val) => setDayType(val as TOvertimeDayType)}
						>
							<SelectTrigger id="dayType" className="text-xs">
								<SelectValue placeholder="Pilih jenis hari..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={OVERTIME_DAY_TYPE.WORKDAY}>
									Hari Kerja Biasa (Workday)
								</SelectItem>
								<SelectItem value={OVERTIME_DAY_TYPE.WEEKLY_OFF}>
									Hari Libur Istirahat Mingguan (Weekend)
								</SelectItem>
								<SelectItem value={OVERTIME_DAY_TYPE.NATIONAL_HOLIDAY}>
									Hari Libur Resmi / Nasional
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="startTime" className="text-xs font-medium">
							Jam Mulai Lembur <span className="text-destructive">*</span>
						</Label>
						<Input
							id="startTime"
							type="time"
							required
							value={startTime}
							onChange={(e) => setStartTime(e.target.value)}
							className="text-xs font-mono"
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="endTime" className="text-xs font-medium">
							Jam Selesai Lembur <span className="text-destructive">*</span>
						</Label>
						<Input
							id="endTime"
							type="time"
							required
							value={endTime}
							onChange={(e) => setEndTime(e.target.value)}
							className="text-xs font-mono"
						/>
					</div>

					<div className="space-y-1.5 sm:col-span-2">
						<Label htmlFor="workScheduleType" className="text-xs font-medium">
							Skema Hari Kerja Perusahaan
						</Label>
						<Select
							value={workScheduleType}
							onValueChange={(val) =>
								setWorkScheduleType(val as TWorkScheduleType)
							}
						>
							<SelectTrigger id="workScheduleType" className="text-xs">
								<SelectValue placeholder="Pilih skema kerja..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={WORK_SCHEDULE_TYPE.FIVE_DAYS}>
									5 Hari Kerja / Minggu (8 jam kerja/hari)
								</SelectItem>
								<SelectItem value={WORK_SCHEDULE_TYPE.SIX_DAYS}>
									6 Hari Kerja / Minggu (7 jam kerja/hari)
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-1.5 sm:col-span-2">
						<Label htmlFor="reason" className="text-xs font-medium">
							Alasan &amp; Rincian Pekerjaan Lembur{" "}
							<span className="text-destructive">*</span>
						</Label>
						<Textarea
							id="reason"
							required
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							placeholder="Pekerjaan darurat penutupan buku tahunan / deployment sistem / maintenance..."
							className="text-xs"
						/>
					</div>
				</CardContent>
			</Card>

			{/* 2. Live Interactive Overtime Calculator & Compliance (PP 35/2021) */}
			<Card className="border border-border/60 shadow-xs bg-linear-to-b from-card to-muted/20">
				<CardHeader className="pb-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<div className="flex size-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
								<Calculator className="size-4" />
							</div>
							<div>
								<CardTitle className="text-base font-semibold">
									2. Simulasi Upah Lembur &amp; Kepatuhan PP 35/2021
								</CardTitle>
								<CardDescription className="text-xs">
									Perhitungan otomatis formula Kemnaker (1/173 × Upah Sebulan ×
									Pengali Bertingkat)
								</CardDescription>
							</div>
						</div>
						{calculateMutation.isPending && (
							<Loader2 className="size-4 animate-spin text-muted-foreground" />
						)}
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{calc ? (
						<>
							<div className="grid gap-4 sm:grid-cols-3">
								<div className="rounded-lg border border-border/60 bg-card p-3">
									<div className="text-[11px] text-muted-foreground flex items-center gap-1">
										<Clock className="size-3" /> Durasi Lembur
									</div>
									<div className="mt-1 font-mono text-lg font-bold text-foreground">
										{(calc.durationMinutes / 60).toFixed(1)} Jam
									</div>
									<div className="text-[10px] text-muted-foreground">
										{calc.durationMinutes} menit total
									</div>
								</div>

								<div className="rounded-lg border border-border/60 bg-card p-3">
									<div className="text-[11px] text-muted-foreground flex items-center gap-1">
										<Coins className="size-3" /> Upah / Jam (1/173)
									</div>
									<div className="mt-1 font-mono text-lg font-bold text-foreground">
										{formatRupiah(calc.hourlyRate)}
									</div>
									<div className="text-[10px] text-muted-foreground">
										Standar PP 35/2021 Pasal 32
									</div>
								</div>

								<div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
									<div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
										Estimasi Kompensasi Lembur
									</div>
									<div className="mt-1 font-mono text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
										{formatRupiah(calc.totalAmount)}
									</div>
									<div className="text-[10px] text-emerald-700/80 dark:text-emerald-300/80">
										Akan dimasukkan ke slip payroll
									</div>
								</div>
							</div>

							{/* Breakdown Pengali Jam */}
							<div className="rounded-lg border border-border/60 bg-card p-3 space-y-2">
								<div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
									<FileText className="size-3.5 text-muted-foreground" />
									Rincian Jam &amp; Bobot Pengali Lembur
								</div>
								<div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
									{calc.breakdown.map((item) => (
										<div
											key={item.hour}
											className="rounded-md border border-border/40 bg-muted/30 p-2 text-xs"
										>
											<div className="font-semibold text-foreground">
												{item.label}
											</div>
											<div className="font-mono text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
												{formatRupiah(item.amount)}
											</div>
										</div>
									))}
								</div>
							</div>

							{/* Peringatan Pelanggaran Norma Ketenagakerjaan */}
							{calc.complianceWarnings.length > 0 ? (
								<div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-3">
									<ShieldAlert className="size-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
									<div className="space-y-1">
										<p className="font-bold text-xs">
											Peringatan Kepatuhan Regulasi Ketenagakerjaan (PP 35/2021)
										</p>
										{calc.complianceWarnings.map((warning, i) => (
											<p key={i} className="text-[11px] leading-relaxed">
												• {warning}
											</p>
										))}
										<p className="text-[10px] text-muted-foreground pt-1">
											Catatan: Hak pembayaran lembur karyawan tetap dibayarkan
											penuh sesuai perhitungan di atas, namun sistem mencatat
											*compliance flag* untuk audit Kemnaker.
										</p>
									</div>
								</div>
							) : (
								<div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
									<Clock className="size-4 text-emerald-600 dark:text-emerald-400" />
									<span>
										Durasi lembur memenuhi batas legal PP 35/2021 (Maksimal 4
										jam/hari dan 18 jam/minggu).
									</span>
								</div>
							)}
						</>
					) : (
						<div className="py-6 text-center text-xs text-muted-foreground">
							Pilih karyawan dan jam lembur untuk melihat simulasi kalkulasi
							kompensasi PP 35/2021.
						</div>
					)}
				</CardContent>
			</Card>

			{/* Actions */}
			<div className="flex items-center justify-end gap-3 pt-2">
				<Button variant="outline" asChild className="text-xs">
					<Link to="/attendance">Batal</Link>
				</Button>
				<Button
					type="submit"
					disabled={createMutation.isPending}
					className="text-xs font-semibold gap-1.5 min-w-36"
				>
					{createMutation.isPending ? (
						<>
							<Loader2 className="size-3.5 animate-spin" />
							Mengajukan…
						</>
					) : (
						<>
							<Send className="size-3.5" />
							Terbitkan SPL Lembur
						</>
					)}
				</Button>
			</div>
		</form>
	);
};
