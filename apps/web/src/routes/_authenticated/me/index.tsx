import { Badge } from "@app/components/ui/badge";
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
import { formatDate, formatRupiah } from "@app/format";
import {
	ATTENDANCE_STATUS,
	LEAVE_REQUEST_STATUS,
	OVERTIME_DAY_TYPE,
	OVERTIME_STATUS,
	WORK_SCHEDULE_TYPE,
} from "@app/schemas";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	CalendarCheck,
	Clock,
	Coins,
	FileText,
	LogIn,
	LogOut,
	UserRound,
} from "lucide-react";
import { useState, type FC, type FormEvent, type ReactElement } from "react";
import {
	useSelfAttendanceList,
	useSelfAttendanceSummary,
	useSelfClockIn,
	useSelfClockOut,
	useSelfLeaveBalances,
	useSelfLeaveCancel,
	useSelfLeaveCreate,
	useSelfLeaveList,
	useSelfLeaveTypes,
	useSelfOvertimeCancel,
	useSelfOvertimeCreate,
	useSelfOvertimeList,
	useSelfPayslipList,
	useSelfProfile,
} from "#/routes/_authenticated/_hooks/use-self-service.ts";

type TTab = "overview" | "attendance" | "leave" | "overtime" | "payslips";

const today = new Date().toISOString().split("T")[0] ?? "";
const currentDate = new Date();

const MySpacePage: FC = (): ReactElement => {
	const [activeTab, setActiveTab] = useState<TTab>("overview");
	const profile = useSelfProfile();
	const linked = profile.data?.linked === true;
	const employee = profile.data?.linked ? profile.data.employee : null;

	const attendance = useSelfAttendanceList(
		{
			page: 1,
			pageSize: 20,
			month: currentDate.getMonth() + 1,
			year: currentDate.getFullYear(),
		},
		linked,
	);
	const summary = useSelfAttendanceSummary(
		{ month: currentDate.getMonth() + 1, year: currentDate.getFullYear() },
		linked,
	);
	const leaveTypes = useSelfLeaveTypes(linked);
	const leaveBalances = useSelfLeaveBalances(currentDate.getFullYear(), linked);
	const leaveList = useSelfLeaveList(
		{ page: 1, pageSize: 50, year: currentDate.getFullYear() },
		linked,
	);
	const overtimeList = useSelfOvertimeList({ page: 1, pageSize: 50 }, linked);
	const payslips = useSelfPayslipList(linked);

	const clockIn = useSelfClockIn();
	const clockOut = useSelfClockOut();
	const leaveCreate = useSelfLeaveCreate();
	const leaveCancel = useSelfLeaveCancel();
	const overtimeCreate = useSelfOvertimeCreate();
	const overtimeCancel = useSelfOvertimeCancel();

	const [leaveTypeId, setLeaveTypeId] = useState("");
	const [leaveStart, setLeaveStart] = useState(today);
	const [leaveEnd, setLeaveEnd] = useState(today);
	const [leaveReason, setLeaveReason] = useState("");
	const [leaveDoctorNote, setLeaveDoctorNote] = useState("");

	const [overtimeDate, setOvertimeDate] = useState(today);
	const [overtimeStart, setOvertimeStart] = useState("18:00");
	const [overtimeEnd, setOvertimeEnd] = useState("20:00");
	const [overtimeDayType, setOvertimeDayType] = useState(
		OVERTIME_DAY_TYPE.WORKDAY,
	);
	const [overtimeReason, setOvertimeReason] = useState("");
	const [overtimeTask, setOvertimeTask] = useState("");

	if (profile.isPending) {
		return (
			<Card>
				<CardContent className="py-12 text-center text-sm text-muted-foreground">
					Memuat data karyawan…
				</CardContent>
			</Card>
		);
	}

	if (!linked || employee === null) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<UserRound className="size-4 text-primary" />
						Ruang Saya
					</CardTitle>
					<CardDescription>
						Akun Anda belum terhubung ke data karyawan. Hubungi HR untuk
						menghubungkan akun dengan data kepegawaian.
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	const attendanceItems = attendance.data?.items ?? [];
	const leaveItems = leaveList.data?.items ?? [];
	const overtimeItems = overtimeList.data?.items ?? [];
	const payslipItems = payslips.data ?? [];
	const selectedLeaveType = (leaveTypes.data ?? []).find(
		(item) => item.id === leaveTypeId,
	);
	const effectiveLeaveTypeId =
		leaveTypeId || selectedLeaveType?.id || leaveTypes.data?.[0]?.id || "";
	const todayLog = attendanceItems.find(
		(item) => item.attendanceDate === today,
	);

	const submitLeave = (event: FormEvent): void => {
		event.preventDefault();
		if (!effectiveLeaveTypeId) return;
		leaveCreate.mutate(
			{
				leaveTypeId: effectiveLeaveTypeId,
				startDate: leaveStart,
				endDate: leaveEnd,
				reason: leaveReason || undefined,
				doctorNoteUrl: leaveDoctorNote || undefined,
			},
			{
				onSuccess: () => {
					setLeaveReason("");
					setLeaveDoctorNote("");
				},
			},
		);
	};

	const submitOvertime = (event: FormEvent): void => {
		event.preventDefault();
		overtimeCreate.mutate(
			{
				overtimeDate,
				startTime: overtimeStart,
				endTime: overtimeEnd,
				dayType: overtimeDayType,
				workScheduleType: employee.workScheduleType,
				reason: overtimeReason || undefined,
				taskDescription: overtimeTask || undefined,
			},
			{
				onSuccess: () => {
					setOvertimeReason("");
					setOvertimeTask("");
				},
			},
		);
	};

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="flex items-center gap-2 text-xl font-bold tracking-tight">
						<UserRound className="size-5 text-primary" />
						Ruang Saya
					</h1>
					<p className="mt-1 text-xs text-muted-foreground">
						{employee.fullName} · {employee.employeeCode} ·{" "}
						{employee.department}
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						size="sm"
						variant="outline"
						onClick={() => clockIn.mutate(undefined)}
						disabled={clockIn.isPending || Boolean(todayLog?.checkIn)}
						className="gap-1.5 text-xs"
					>
						<LogIn className="size-3.5" />
						Clock In
					</Button>
					<Button
						size="sm"
						variant="outline"
						onClick={() => clockOut.mutate(undefined)}
						disabled={clockOut.isPending || Boolean(todayLog?.checkOut)}
						className="gap-1.5 text-xs"
					>
						<LogOut className="size-3.5" />
						Clock Out
					</Button>
				</div>
			</div>

			<div className="flex flex-wrap items-center gap-2 border-b border-border/40 pb-2">
				{(
					[
						["overview", "Ringkasan"],
						["attendance", "Presensi"],
						["leave", "Cuti"],
						["overtime", "Lembur"],
						["payslips", "Slip Gaji"],
					] as const
				).map(([key, label]) => (
					<Button
						key={key}
						size="sm"
						variant={activeTab === key ? "secondary" : "ghost"}
						onClick={() => setActiveTab(key)}
						className="text-xs"
					>
						{label}
					</Button>
				))}
			</div>

			{activeTab === "overview" && (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardContent className="p-5">
							<div className="text-xs text-muted-foreground">
								Hadir Bulan Ini
							</div>
							<div className="mt-1 text-2xl font-bold">
								{summary.data?.totalPresent ?? 0}
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-5">
							<div className="text-xs text-muted-foreground">Terlambat</div>
							<div className="mt-1 text-2xl font-bold">
								{summary.data?.totalLateMinutes ?? 0} mnt
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-5">
							<div className="text-xs text-muted-foreground">
								Cuti Disetujui
							</div>
							<div className="mt-1 text-2xl font-bold">
								{leaveItems.filter((item) => item.status === "approved").length}
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-5">
							<div className="text-xs text-muted-foreground">Slip Terbaru</div>
							<div className="mt-1 text-lg font-bold">
								{payslipItems[0] ? formatRupiah(payslipItems[0].netPay) : "-"}
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{activeTab === "attendance" && (
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-semibold">
							Presensi Bulan Ini
						</CardTitle>
						<CardDescription className="text-xs">
							Jadwal: {employee.workStartTime}–{employee.workEndTime} WIB ·{" "}
							{employee.workScheduleType === WORK_SCHEDULE_TYPE.SIX_DAYS
								? "6 hari kerja"
								: "5 hari kerja"}
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col gap-2">
						{attendanceItems.length === 0 ? (
							<p className="py-6 text-center text-xs text-muted-foreground">
								Belum ada data presensi.
							</p>
						) : (
							attendanceItems.map((item) => (
								<div
									key={item.id}
									className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/40 p-3 text-xs"
								>
									<div className="flex items-center gap-2 font-medium">
										<CalendarCheck className="size-3.5 text-muted-foreground" />
										{formatDate(item.attendanceDate)}
									</div>
									<Badge variant="outline" className="text-[10px] uppercase">
										{item.status}
									</Badge>
									<div className="flex items-center gap-3 text-muted-foreground">
										<span className="flex items-center gap-1">
											<Clock className="size-3" />
											{item.checkIn
												? new Date(item.checkIn).toLocaleTimeString("id-ID", {
														timeZone: "Asia/Jakarta",
														hour: "2-digit",
														minute: "2-digit",
													})
												: "-"}
										</span>
										<span>
											{item.effectiveWorkMinutes > 0
												? `${(item.effectiveWorkMinutes / 60).toFixed(1)} jam`
												: "-"}
										</span>
										{item.lateMinutes > 0 && (
											<span className="text-rose-500">
												+{item.lateMinutes} mnt
											</span>
										)}
									</div>
								</div>
							))
						)}
					</CardContent>
				</Card>
			)}

			{activeTab === "leave" && (
				<div className="grid gap-6 lg:grid-cols-5">
					<Card className="lg:col-span-2">
						<CardHeader>
							<CardTitle className="text-sm font-semibold">
								Ajukan Cuti
							</CardTitle>
						</CardHeader>
						<CardContent>
							<form onSubmit={submitLeave} className="flex flex-col gap-3">
								<div className="space-y-1.5">
									<Label className="text-xs">Jenis Cuti</Label>
									<Select
										value={effectiveLeaveTypeId}
										onValueChange={setLeaveTypeId}
									>
										<SelectTrigger className="text-xs">
											<SelectValue placeholder="Pilih jenis cuti" />
										</SelectTrigger>
										<SelectContent>
											{(leaveTypes.data ?? []).map((item) => (
												<SelectItem key={item.id} value={item.id}>
													{item.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="grid grid-cols-2 gap-2">
									<div className="space-y-1.5">
										<Label htmlFor="selfLeaveStart" className="text-xs">
											Mulai
										</Label>
										<Input
											id="selfLeaveStart"
											type="date"
											required
											value={leaveStart}
											onChange={(e) => setLeaveStart(e.target.value)}
											className="text-xs"
										/>
									</div>
									<div className="space-y-1.5">
										<Label htmlFor="selfLeaveEnd" className="text-xs">
											Selesai
										</Label>
										<Input
											id="selfLeaveEnd"
											type="date"
											required
											value={leaveEnd}
											onChange={(e) => setLeaveEnd(e.target.value)}
											className="text-xs"
										/>
									</div>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="selfLeaveReason" className="text-xs">
										Alasan
									</Label>
									<Textarea
										id="selfLeaveReason"
										value={leaveReason}
										onChange={(e) => setLeaveReason(e.target.value)}
										className="text-xs"
									/>
								</div>
								{selectedLeaveType?.requiresDoctorNote && (
									<div className="space-y-1.5">
										<Label htmlFor="selfDoctorNote" className="text-xs">
											URL Surat Dokter
										</Label>
										<Input
											id="selfDoctorNote"
											type="url"
											value={leaveDoctorNote}
											onChange={(e) => setLeaveDoctorNote(e.target.value)}
											className="text-xs"
										/>
									</div>
								)}
								<Button
									type="submit"
									size="sm"
									disabled={leaveCreate.isPending || !effectiveLeaveTypeId}
									className="w-fit text-xs"
								>
									Kirim Pengajuan
								</Button>
							</form>
						</CardContent>
					</Card>

					<div className="flex flex-col gap-4 lg:col-span-3">
						<Card>
							<CardHeader>
								<CardTitle className="text-sm font-semibold">
									Saldo Cuti {currentDate.getFullYear()}
								</CardTitle>
							</CardHeader>
							<CardContent className="grid gap-2 sm:grid-cols-2">
								{(leaveBalances.data ?? []).length === 0 ? (
									<p className="text-xs text-muted-foreground">
										Belum ada saldo cuti.
									</p>
								) : (
									(leaveBalances.data ?? []).map((balance) => (
										<div
											key={balance.id}
											className="rounded-lg border border-border/40 p-3 text-xs"
										>
											<div className="text-muted-foreground">
												{leaveTypes.data?.find(
													(item) => item.id === balance.leaveTypeId,
												)?.name ?? balance.leaveTypeId}
											</div>
											<div className="mt-1 font-mono font-semibold">
												{balance.remainingDays} hari tersisa
											</div>
										</div>
									))
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-sm font-semibold">
									Riwayat Cuti
								</CardTitle>
							</CardHeader>
							<CardContent className="flex flex-col gap-2">
								{leaveItems.length === 0 ? (
									<p className="py-4 text-center text-xs text-muted-foreground">
										Belum ada pengajuan cuti.
									</p>
								) : (
									leaveItems.map((item) => (
										<div
											key={item.id}
											className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/40 p-3 text-xs"
										>
											<div>
												<div className="font-medium">
													{item.leaveTypeName ?? "Cuti"}
												</div>
												<div className="text-[11px] text-muted-foreground">
													{formatDate(item.startDate)} –{" "}
													{formatDate(item.endDate)} · {item.totalDays} hari
												</div>
											</div>
											<div className="flex items-center gap-2">
												<Badge
													variant="outline"
													className="text-[10px] uppercase"
												>
													{item.status}
												</Badge>
												{(item.status === LEAVE_REQUEST_STATUS.PENDING ||
													item.status === LEAVE_REQUEST_STATUS.APPROVED) && (
													<Button
														size="sm"
														variant="ghost"
														onClick={() => leaveCancel.mutate({ id: item.id })}
														disabled={leaveCancel.isPending}
														className="h-7 text-[10px] text-muted-foreground hover:text-destructive"
													>
														Batalkan
													</Button>
												)}
											</div>
										</div>
									))
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			)}

			{activeTab === "overtime" && (
				<div className="grid gap-6 lg:grid-cols-5">
					<Card className="lg:col-span-2">
						<CardHeader>
							<CardTitle className="text-sm font-semibold">
								Ajukan Lembur
							</CardTitle>
						</CardHeader>
						<CardContent>
							<form onSubmit={submitOvertime} className="flex flex-col gap-3">
								<div className="space-y-1.5">
									<Label htmlFor="selfOvertimeDate" className="text-xs">
										Tanggal
									</Label>
									<Input
										id="selfOvertimeDate"
										type="date"
										required
										value={overtimeDate}
										onChange={(e) => setOvertimeDate(e.target.value)}
										className="text-xs"
									/>
								</div>
								<div className="grid grid-cols-2 gap-2">
									<div className="space-y-1.5">
										<Label htmlFor="selfOvertimeStart" className="text-xs">
											Mulai
										</Label>
										<Input
											id="selfOvertimeStart"
											type="time"
											required
											value={overtimeStart}
											onChange={(e) => setOvertimeStart(e.target.value)}
											className="text-xs"
										/>
									</div>
									<div className="space-y-1.5">
										<Label htmlFor="selfOvertimeEnd" className="text-xs">
											Selesai
										</Label>
										<Input
											id="selfOvertimeEnd"
											type="time"
											required
											value={overtimeEnd}
											onChange={(e) => setOvertimeEnd(e.target.value)}
											className="text-xs"
										/>
									</div>
								</div>
								<div className="space-y-1.5">
									<Label className="text-xs">Jenis Hari</Label>
									<Select
										value={overtimeDayType}
										onValueChange={(value) =>
											setOvertimeDayType(value as typeof overtimeDayType)
										}
									>
										<SelectTrigger className="text-xs">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value={OVERTIME_DAY_TYPE.WORKDAY}>
												Hari Kerja
											</SelectItem>
											<SelectItem value={OVERTIME_DAY_TYPE.WEEKLY_OFF}>
												Hari Libur Mingguan
											</SelectItem>
											<SelectItem value={OVERTIME_DAY_TYPE.NATIONAL_HOLIDAY}>
												Hari Libur Nasional
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="selfOvertimeReason" className="text-xs">
										Alasan
									</Label>
									<Textarea
										id="selfOvertimeReason"
										value={overtimeReason}
										onChange={(e) => setOvertimeReason(e.target.value)}
										className="text-xs"
									/>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="selfOvertimeTask" className="text-xs">
										Deskripsi Pekerjaan
									</Label>
									<Textarea
										id="selfOvertimeTask"
										value={overtimeTask}
										onChange={(e) => setOvertimeTask(e.target.value)}
										className="text-xs"
									/>
								</div>
								<Button
									type="submit"
									size="sm"
									disabled={overtimeCreate.isPending}
									className="w-fit text-xs"
								>
									Kirim Pengajuan
								</Button>
							</form>
						</CardContent>
					</Card>

					<Card className="lg:col-span-3">
						<CardHeader>
							<CardTitle className="text-sm font-semibold">
								Riwayat Lembur
							</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-col gap-2">
							{overtimeItems.length === 0 ? (
								<p className="py-4 text-center text-xs text-muted-foreground">
									Belum ada pengajuan lembur.
								</p>
							) : (
								overtimeItems.map((item) => (
									<div
										key={item.id}
										className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/40 p-3 text-xs"
									>
										<div>
											<div className="font-medium">
												{formatDate(item.overtimeDate)} · {item.startTime}–
												{item.endTime}
											</div>
											<div className="text-[11px] text-muted-foreground">
												{formatRupiah(item.calculatedAmount)}
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Badge
												variant="outline"
												className="text-[10px] uppercase"
											>
												{item.status}
											</Badge>
											{(item.status === OVERTIME_STATUS.PENDING ||
												item.status === OVERTIME_STATUS.APPROVED) && (
												<Button
													size="sm"
													variant="ghost"
													onClick={() => overtimeCancel.mutate({ id: item.id })}
													disabled={overtimeCancel.isPending}
													className="h-7 text-[10px] text-muted-foreground hover:text-destructive"
												>
													Batalkan
												</Button>
											)}
										</div>
									</div>
								))
							)}
						</CardContent>
					</Card>
				</div>
			)}

			{activeTab === "payslips" && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-sm font-semibold">
							<Coins className="size-4 text-emerald-500" />
							Slip Gaji
						</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-col gap-2">
						{payslipItems.length === 0 ? (
							<p className="py-6 text-center text-xs text-muted-foreground">
								Belum ada slip gaji.
							</p>
						) : (
							payslipItems.map((item) => (
								<Link
									key={item.id}
									to="/me/payslips/$itemId"
									params={{ itemId: item.id }}
									className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/40 p-3 text-xs transition-colors hover:bg-muted/30"
								>
									<div className="flex items-center gap-2">
										<FileText className="size-3.5 text-muted-foreground" />
										<span className="font-medium">
											{formatDate(item.createdAt)}
										</span>
									</div>
									<div className="flex items-center gap-3">
										<span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
											{formatRupiah(item.netPay)}
										</span>
										<span className="text-[10px] text-muted-foreground">
											Lihat slip
										</span>
									</div>
								</Link>
							))
						)}
					</CardContent>
				</Card>
			)}

			{activeTab === "attendance" && (
				<p className="text-[11px] text-muted-foreground">
					Status: {ATTENDANCE_STATUS.PRESENT} · Data mengikuti jadwal kerja
					karyawan.
				</p>
			)}
		</div>
	);
};

export const Route = createFileRoute("/_authenticated/me/")({
	component: MySpacePage,
});
