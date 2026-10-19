import {
	Card,
	CardContent,
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
import { PERMISSION } from "@app/permissions";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarCheck, Clock, FileText, UserX } from "lucide-react";
import { useState, type FC, type ReactElement } from "react";
import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import { orpc } from "#/libs/orpc/client.ts";
import { suspenseQueryOptionsFor } from "#/libs/orpc/procedure-query.ts";
import { useAttendanceSummary } from "#/routes/_authenticated/attendance/_hooks/use-attendance.ts";
import { Button } from "@app/components/ui/button";

const CURRENT_DATE = new Date();
const PAGE_SIZE = 100;

const AttendanceReportPage: FC = (): ReactElement => {
	const employeesQuery = useSuspenseQuery(
		suspenseQueryOptionsFor(orpc.employee.list, {
			page: 1,
			pageSize: PAGE_SIZE,
		}),
	);
	const employees = employeesQuery.data.items;

	const [employeeId, setEmployeeId] = useState(employees[0]?.id ?? "");
	const [month, setMonth] = useState(CURRENT_DATE.getMonth() + 1);
	const [year, setYear] = useState(CURRENT_DATE.getFullYear());

	const summary = useAttendanceSummary({ employeeId, month, year });
	const effectiveHours = Math.round(
		summary.data.totalEffectiveWorkMinutes / 60,
	);

	const metrics = [
		{
			label: "Hadir",
			value: summary.data.totalPresent,
			icon: CalendarCheck,
			className: "text-emerald-600 dark:text-emerald-400",
		},
		{
			label: "Sakit",
			value: summary.data.totalSick,
			icon: FileText,
			className: "text-blue-600 dark:text-blue-400",
		},
		{
			label: "Izin",
			value: summary.data.totalPermitted,
			icon: FileText,
			className: "text-indigo-600 dark:text-indigo-400",
		},
		{
			label: "Cuti",
			value: summary.data.totalLeave,
			icon: CalendarCheck,
			className: "text-violet-600 dark:text-violet-400",
		},
		{
			label: "Mangkir",
			value: summary.data.totalAbsent,
			icon: UserX,
			className: "text-rose-600 dark:text-rose-400",
		},
		{
			label: "Menit Terlambat",
			value: summary.data.totalLateMinutes,
			icon: Clock,
			className: "text-amber-600 dark:text-amber-400",
		},
	];

	return (
		<div className="flex flex-col gap-6">
			<div className="border-b border-border/40 pb-4">
				<Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
					<Link to="/attendance">
						<ArrowLeft className="size-3.5" />
						Kembali ke Kehadiran
					</Link>
				</Button>
				<h1 className="mt-2 flex items-center gap-2 text-xl font-bold tracking-tight">
					<CalendarCheck className="size-5 text-primary" />
					Rekap Absensi Bulanan
				</h1>
				<p className="mt-1 text-xs text-muted-foreground">
					Ringkasan kehadiran, keterlambatan, dan jam kerja efektif per
					karyawan.
				</p>
			</div>

			<Card>
				<CardContent className="grid gap-4 pt-6 sm:grid-cols-3">
					<div className="space-y-1.5 sm:col-span-1">
						<Label className="text-xs">Karyawan</Label>
						<Select value={employeeId} onValueChange={setEmployeeId}>
							<SelectTrigger className="text-xs">
								<SelectValue placeholder="Pilih karyawan" />
							</SelectTrigger>
							<SelectContent>
								{employees.map((employee) => (
									<SelectItem key={employee.id} value={employee.id}>
										{employee.fullName} ({employee.employeeCode})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="reportMonth" className="text-xs">
							Bulan
						</Label>
						<Input
							id="reportMonth"
							type="number"
							min={1}
							max={12}
							value={month}
							onChange={(e) => setMonth(Number(e.target.value))}
							className="font-mono text-xs"
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="reportYear" className="text-xs">
							Tahun
						</Label>
						<Input
							id="reportYear"
							type="number"
							min={2000}
							max={2100}
							value={year}
							onChange={(e) => setYear(Number(e.target.value))}
							className="font-mono text-xs"
						/>
					</div>
				</CardContent>
			</Card>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{metrics.map((metric) => (
					<Card key={metric.label}>
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-xs text-muted-foreground">
								{metric.label}
							</CardTitle>
							<metric.icon className={`size-4 ${metric.className}`} />
						</CardHeader>
						<CardContent>
							<p className={`text-2xl font-bold ${metric.className}`}>
								{metric.value}
							</p>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="grid gap-4 sm:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-xs text-muted-foreground">
							Hari Kerja
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">
							{summary.data.totalWorkingDays}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-xs text-muted-foreground">
							Jam Kerja Efektif
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">{effectiveHours} jam</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-xs text-muted-foreground">
							Total Terlambat
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">
							{summary.data.totalLateMinutes} menit
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export const Route = createFileRoute("/_authenticated/attendance/report")({
	beforeLoad: checkRoutePermissions({
		permissions: [PERMISSION.ATTENDANCE_READ],
	}),
	component: AttendanceReportPage,
});
