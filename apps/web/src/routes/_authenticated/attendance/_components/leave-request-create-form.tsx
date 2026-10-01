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
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
	Baby,
	CalendarDays,
	HeartPulse,
	Info,
	Loader2,
	Send,
	User,
} from "lucide-react";
import { useState, type FC, type FormEvent, type ReactElement } from "react";
import { orpc } from "#/libs/orpc/client.ts";
import { suspenseQueryOptionsFor } from "#/libs/orpc/procedure-query.ts";
import {
	useLeaveRequestCreate,
	useLeaveTypeList,
} from "#/routes/_authenticated/attendance/_hooks/use-attendance.ts";

export const LeaveRequestCreateForm: FC = (): ReactElement => {
	const navigate = useNavigate();
	const createMutation = useLeaveRequestCreate();

	const employeesQuery = useSuspenseQuery(
		suspenseQueryOptionsFor(orpc.employee.list, { page: 1, pageSize: 100 }),
	);
	const employees = employeesQuery.data.items;

	const leaveTypesQuery = useLeaveTypeList();
	const leaveTypes = leaveTypesQuery.data;

	const today = new Date().toISOString().split("T")[0] ?? "2026-10-01";
	const [employeeId, setEmployeeId] = useState(employees[0]?.id ?? "");
	const [leaveTypeId, setLeaveTypeId] = useState(leaveTypes[0]?.id ?? "");
	const [startDate, setStartDate] = useState(today);
	const [endDate, setEndDate] = useState(today);
	const [reason, setReason] = useState("");
	const [doctorNoteUrl, setDoctorNoteUrl] = useState("");

	const selectedType = leaveTypes.find((lt) => lt.id === leaveTypeId);
	const isMaternity =
		selectedType?.code === "MATERNITY" ||
		selectedType?.name.toLowerCase().includes("melahirkan");
	const isSick =
		selectedType?.code === "SICK" ||
		selectedType?.requiresDoctorNote ||
		selectedType?.name.toLowerCase().includes("sakit");

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		createMutation.mutate(
			{
				employeeId,
				leaveTypeId,
				startDate,
				endDate,
				reason,
				doctorNoteUrl: doctorNoteUrl || undefined,
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
			{/* 1. Karyawan & Jenis Cuti */}
			<Card className="border border-border/60 shadow-xs">
				<CardHeader className="pb-4">
					<div className="flex items-center gap-2">
						<div className="flex size-7 items-center justify-center rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
							<User className="size-4" />
						</div>
						<div>
							<CardTitle className="text-base font-semibold">
								1. Karyawan &amp; Jenis Hak Cuti
							</CardTitle>
							<CardDescription className="text-xs">
								Pilih pemohon cuti dan skema permohonan sesuai ketentuan
								ketenagakerjaan
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-1.5 sm:col-span-2">
						<Label htmlFor="employeeSelect" className="text-xs font-medium">
							Karyawan Pemohon <span className="text-destructive">*</span>
						</Label>
						<Select value={employeeId} onValueChange={setEmployeeId}>
							<SelectTrigger id="employeeSelect" className="text-xs">
								<SelectValue placeholder="Pilih karyawan..." />
							</SelectTrigger>
							<SelectContent>
								{employees.map((emp) => (
									<SelectItem key={emp.id} value={emp.id}>
										{emp.fullName} ({emp.employeeCode}) - {emp.department}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-1.5 sm:col-span-2">
						<Label htmlFor="leaveTypeSelect" className="text-xs font-medium">
							Jenis Cuti / Izin <span className="text-destructive">*</span>
						</Label>
						<Select value={leaveTypeId} onValueChange={setLeaveTypeId}>
							<SelectTrigger id="leaveTypeSelect" className="text-xs">
								<SelectValue placeholder="Pilih jenis cuti..." />
							</SelectTrigger>
							<SelectContent>
								{leaveTypes.map((lt) => (
									<SelectItem key={lt.id} value={lt.id}>
										{lt.name} (
										{lt.category !== "unpaid" ? "Berbayar / Paid" : "Unpaid"}) -
										Kuota: {lt.defaultDays} hari
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Informasi Regulasi Spesifik UU KIA 2024 / UU 13/2003 */}
			{isMaternity && (
				<div className="rounded-xl border border-pink-500/30 bg-pink-500/10 p-4 text-xs text-pink-900 dark:text-pink-200 flex items-start gap-3">
					<Baby className="size-5 shrink-0 text-pink-600 dark:text-pink-400 mt-0.5" />
					<div className="space-y-1.5">
						<p className="font-semibold text-xs">
							Ketentuan UU KIA No. 4 Tahun 2024 (Kesejahteraan Ibu dan Anak)
						</p>
						<p className="text-[11px] leading-relaxed opacity-90">
							• <strong>3 Bulan Pertama:</strong> Berhak mendapatkan upah penuh
							100%.
							<br />• <strong>Bulan ke-4 s.d. ke-6:</strong> Dapat diperpanjang
							hingga total 6 bulan jika terdapat kondisi medis khusus anak/ibu
							dengan rekomendasi dokter (upah dibayar 75%).
						</p>
					</div>
				</div>
			)}

			{isSick && (
				<div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-3">
					<HeartPulse className="size-5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
					<div className="space-y-1.5">
						<p className="font-semibold text-xs">
							Ketentuan Perlindungan Sakit Berkepanjangan (Pasal 93 UU
							Ketenagakerjaan)
						</p>
						<p className="text-[11px] leading-relaxed opacity-90">
							Upah sakit bertingkat: 4 bulan pertama 100%, 4 bulan kedua 75%, 4
							bulan ketiga 50%, selanjutnya 25% sebelum proses PHK medis.
						</p>
					</div>
				</div>
			)}

			{/* 2. Rentang Tanggal & Alasan */}
			<Card className="border border-border/60 shadow-xs">
				<CardHeader className="pb-4">
					<div className="flex items-center gap-2">
						<div className="flex size-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
							<CalendarDays className="size-4" />
						</div>
						<div>
							<CardTitle className="text-base font-semibold">
								2. Periode Cuti &amp; Surat Keterangan
							</CardTitle>
							<CardDescription className="text-xs">
								Tentukan tanggal awal dan akhir serta dokumen pendukung
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-1.5">
						<Label htmlFor="startDate" className="text-xs font-medium">
							Tanggal Mulai Cuti <span className="text-destructive">*</span>
						</Label>
						<Input
							id="startDate"
							type="date"
							required
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
							className="text-xs font-mono"
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="endDate" className="text-xs font-medium">
							Tanggal Selesai Cuti <span className="text-destructive">*</span>
						</Label>
						<Input
							id="endDate"
							type="date"
							required
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
							className="text-xs font-mono"
						/>
					</div>

					<div className="space-y-1.5 sm:col-span-2">
						<Label htmlFor="reason" className="text-xs font-medium">
							Alasan / Keterangan Cuti{" "}
							<span className="text-destructive">*</span>
						</Label>
						<Textarea
							id="reason"
							required
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							placeholder="Jelaskan keperluan cuti atau diagnosis rujukan dokter..."
							className="text-xs"
						/>
					</div>

					<div className="space-y-1.5 sm:col-span-2">
						<Label
							htmlFor="doctorNote"
							className="text-xs font-medium flex items-center justify-between"
						>
							<span>Tautan / URL Surat Dokter</span>
							{selectedType?.requiresDoctorNote && (
								<span className="text-destructive text-[11px] font-semibold">
									* Wajib untuk jenis cuti ini
								</span>
							)}
						</Label>
						<Input
							id="doctorNote"
							value={doctorNoteUrl}
							onChange={(e) => setDoctorNoteUrl(e.target.value)}
							placeholder="https://drive.google.com/... atau tautan dokumen rekam medis"
							className="text-xs font-mono"
							required={selectedType?.requiresDoctorNote}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Kebijakan Carry Over */}
			<div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-xs text-muted-foreground flex items-center gap-3">
				<Info className="size-4 shrink-0 text-primary" />
				<span>
					<strong>Kebijakan Saldo Cuti:</strong> Hak cuti tahunan timbul setelah
					masa kerja 12 bulan. Sisa cuti tahun lalu yang di-carry over akan
					otomatis hangus (*forfeited*) per tanggal <strong>30 Juni</strong>{" "}
					tahun berjalan sesuai regulasi operasional.
				</span>
			</div>

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
							Mengirim…
						</>
					) : (
						<>
							<Send className="size-3.5" />
							Kirim Permohonan Cuti
						</>
					)}
				</Button>
			</div>
		</form>
	);
};
