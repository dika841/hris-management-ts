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
import { ATTENDANCE_STATUS, type TAttendanceStatus } from "@app/schemas";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { CalendarCheck, Clock, Loader2, User } from "lucide-react";
import { useState, type FC, type FormEvent, type ReactElement } from "react";
import { orpc } from "#/libs/orpc/client.ts";
import { suspenseQueryOptionsFor } from "#/libs/orpc/procedure-query.ts";
import { useAttendanceLog } from "#/routes/_authenticated/attendance/_hooks/use-attendance.ts";

export const AttendanceLogForm: FC = (): ReactElement => {
	const navigate = useNavigate();
	const logMutation = useAttendanceLog();

	const employeesQuery = useSuspenseQuery(
		suspenseQueryOptionsFor(orpc.employee.list, { page: 1, pageSize: 100 }),
	);
	const employees = employeesQuery.data.items;

	const today = new Date().toISOString().split("T")[0] ?? "2026-10-01";
	const [employeeId, setEmployeeId] = useState(employees[0]?.id ?? "");
	const [attendanceDate, setAttendanceDate] = useState(today);
	const [status, setStatus] = useState<TAttendanceStatus>(
		ATTENDANCE_STATUS.PRESENT,
	);
	const [notes, setNotes] = useState("");

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		logMutation.mutate(
			{
				employeeId,
				attendanceDate,
				status,
				notes: notes || undefined,
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
			{/* 1. Karyawan & Tanggal */}
			<Card className="border border-border/60 shadow-xs">
				<CardHeader className="pb-4">
					<div className="flex items-center gap-2">
						<div className="flex size-7 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
							<User className="size-4" />
						</div>
						<div>
							<CardTitle className="text-base font-semibold">
								1. Karyawan & Tanggal Kehadiran
							</CardTitle>
							<CardDescription className="text-xs">
								Pilih karyawan dan tanggal pencatatan presensi kerja
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-1.5 sm:col-span-2">
						<Label htmlFor="employeeSelect" className="text-xs font-medium">
							Pilih Karyawan <span className="text-destructive">*</span>
						</Label>
						<Select value={employeeId} onValueChange={setEmployeeId}>
							<SelectTrigger id="employeeSelect" className="text-xs">
								<SelectValue placeholder="Pilih karyawan..." />
							</SelectTrigger>
							<SelectContent>
								{employees.map((emp) => (
									<SelectItem key={emp.id} value={emp.id}>
										{emp.fullName} ({emp.employeeCode}) - {emp.position}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="logDate" className="text-xs font-medium">
							Tanggal Presensi <span className="text-destructive">*</span>
						</Label>
						<Input
							id="logDate"
							type="date"
							required
							value={attendanceDate}
							onChange={(e) => setAttendanceDate(e.target.value)}
							className="text-xs font-mono"
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="statusSelect" className="text-xs font-medium">
							Status Kehadiran <span className="text-destructive">*</span>
						</Label>
						<Select
							value={status}
							onValueChange={(val) => setStatus(val as TAttendanceStatus)}
						>
							<SelectTrigger id="statusSelect" className="text-xs">
								<SelectValue placeholder="Pilih status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={ATTENDANCE_STATUS.PRESENT}>
									Hadir (Present)
								</SelectItem>
								<SelectItem value={ATTENDANCE_STATUS.ABSENT}>
									Mangkir / Tanpa Keterangan (Alpha)
								</SelectItem>
								<SelectItem value={ATTENDANCE_STATUS.SICK}>
									Sakit (Sick)
								</SelectItem>
								<SelectItem value={ATTENDANCE_STATUS.LEAVE}>
									Cuti (On Leave)
								</SelectItem>
								<SelectItem value={ATTENDANCE_STATUS.PERMITTED}>
									Izin Resmi (Permitted)
								</SelectItem>
								<SelectItem value={ATTENDANCE_STATUS.OFF}>
									Off / Libur Mingguan
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* 2. Catatan Presensi */}
			<Card className="border border-border/60 shadow-xs">
				<CardHeader className="pb-4">
					<div className="flex items-center gap-2">
						<div className="flex size-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
							<Clock className="size-4" />
						</div>
						<div>
							<CardTitle className="text-base font-semibold">
								2. Keterangan & Catatan
							</CardTitle>
							<CardDescription className="text-xs">
								Catatan dinas luar, alasan dispensasi, atau keterangan lainnya
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-1.5">
						<Label htmlFor="notes" className="text-xs font-medium">
							Catatan Tambahan
						</Label>
						<Textarea
							id="notes"
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder="Keterangan dinas luar, dispensasi, lokasi tugas khusus..."
							className="text-xs"
						/>
					</div>
				</CardContent>
			</Card>

			{/* Actions */}
			<div className="flex items-center justify-end gap-3 pt-2">
				<Button variant="outline" asChild className="text-xs">
					<Link to="/attendance">Batal</Link>
				</Button>
				<Button
					type="submit"
					disabled={logMutation.isPending}
					className="text-xs font-semibold gap-1.5 min-w-36"
				>
					{logMutation.isPending ? (
						<>
							<Loader2 className="size-3.5 animate-spin" />
							Menyimpan…
						</>
					) : (
						<>
							<CalendarCheck className="size-3.5" />
							Simpan Presensi
						</>
					)}
				</Button>
			</div>
		</form>
	);
};
