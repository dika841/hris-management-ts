import { usePermissions } from "@app/components/guard/use-permissions";
import { Badge } from "@app/components/ui/badge";
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
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@app/components/ui/table";
import { formatRupiah } from "@app/format";
import { PERMISSION } from "@app/permissions";
import { createFileRoute } from "@tanstack/react-router";
import {
	BarChart3,
	Clock,
	TrendingDown,
	TrendingUp,
	Users,
} from "lucide-react";
import { useState, type FC, type ReactElement } from "react";
import { useI18n } from "#/libs/i18n/index.ts";
import {
	useAnalyticsAttendance,
	useAnalyticsOverview,
	useAnalyticsPayrollTrend,
} from "#/routes/_authenticated/_hooks/use-analytics.ts";

const currentDate = new Date();
const today = currentDate.toISOString().slice(0, 10);
const year = currentDate.getFullYear();

const AnalyticsPage: FC = (): ReactElement => {
	const { isIndonesian } = useI18n();
	const { canAll } = usePermissions();
	const canReadPayroll = canAll([PERMISSION.PAYROLL_READ]);
	const canReadAttendance = canAll([PERMISSION.ATTENDANCE_READ]);

	const [from, setFrom] = useState(`${year}-01-01`);
	const [to, setTo] = useState(today);

	const overview = useAnalyticsOverview({ from, to }, true);
	const payrollTrend = useAnalyticsPayrollTrend({ year }, canReadPayroll);
	const attendance = useAnalyticsAttendance(
		{ month: currentDate.getMonth() + 1, year },
		canReadAttendance,
	);

	const data = overview.data;
	const maxDepartment = Math.max(
		1,
		...(data?.byDepartment.map((item) => item.count) ?? [1]),
	);
	const attendanceCount = (status: string): number =>
		attendance.data?.byStatus.find((item) => item.status === status)?.count ??
		0;

	const metrics = [
		{
			label: isIndonesian ? "Headcount Aktif" : "Active Headcount",
			value: data?.headcount.total ?? 0,
			icon: Users,
			className: "text-blue-600 dark:text-blue-400",
		},
		{
			label: isIndonesian ? "Karyawan Baru" : "New Hires",
			value: data?.movement.newHires ?? 0,
			icon: TrendingUp,
			className: "text-emerald-600 dark:text-emerald-400",
		},
		{
			label: isIndonesian ? "Karyawan Keluar" : "Exits",
			value: data?.movement.exits ?? 0,
			icon: TrendingDown,
			className: "text-rose-600 dark:text-rose-400",
		},
		{
			label: isIndonesian ? "Turnover Rate" : "Turnover Rate",
			value: `${data?.movement.turnoverRate ?? 0}%`,
			icon: BarChart3,
			className: "text-violet-600 dark:text-violet-400",
		},
	];

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="flex items-center gap-2 text-xl font-bold tracking-tight">
						<BarChart3 className="size-5 text-primary" />
						{isIndonesian ? "Analitik HR" : "HR Analytics"}
					</h1>
					<p className="mt-1 text-xs text-muted-foreground">
						{isIndonesian
							? "Headcount, pergerakan karyawan, biaya payroll, dan kehadiran."
							: "Headcount, workforce movement, payroll cost, and attendance."}
					</p>
				</div>
				<div className="flex items-end gap-2">
					<div className="space-y-1">
						<Label htmlFor="analyticsFrom" className="text-[10px]">
							{isIndonesian ? "Dari" : "From"}
						</Label>
						<Input
							id="analyticsFrom"
							type="date"
							value={from}
							onChange={(event) => setFrom(event.target.value)}
							className="h-8 text-xs"
						/>
					</div>
					<div className="space-y-1">
						<Label htmlFor="analyticsTo" className="text-[10px]">
							{isIndonesian ? "Sampai" : "To"}
						</Label>
						<Input
							id="analyticsTo"
							type="date"
							value={to}
							onChange={(event) => setTo(event.target.value)}
							className="h-8 text-xs"
						/>
					</div>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

			<div className="grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-semibold">
							{isIndonesian
								? "Headcount per Departemen"
								: "Headcount by Department"}
						</CardTitle>
						<CardDescription className="text-xs">
							{isIndonesian
								? "Karyawan aktif berdasarkan departemen"
								: "Active employees by department"}
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col gap-3">
						{(data?.byDepartment ?? []).length === 0 ? (
							<p className="text-xs text-muted-foreground">
								{isIndonesian ? "Belum ada data." : "No data yet."}
							</p>
						) : (
							data?.byDepartment.map((item) => (
								<div key={item.department} className="space-y-1">
									<div className="flex items-center justify-between text-xs">
										<span>{item.department}</span>
										<span className="font-mono font-semibold">
											{item.count}
										</span>
									</div>
									<div className="h-2 overflow-hidden rounded-full bg-muted">
										<div
											className="h-full rounded-full bg-primary"
											style={{
												width: `${(item.count / maxDepartment) * 100}%`,
											}}
										/>
									</div>
								</div>
							))
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-sm font-semibold">
							<Clock className="size-4 text-blue-500" />
							{isIndonesian ? "Ringkasan Kehadiran" : "Attendance Summary"}
						</CardTitle>
						<CardDescription className="text-xs">
							{currentDate.toLocaleDateString(
								isIndonesian ? "id-ID" : "en-US",
								{
									month: "long",
									year: "numeric",
								},
							)}
						</CardDescription>
					</CardHeader>
					<CardContent className="grid grid-cols-2 gap-3 text-xs">
						<div className="rounded-lg border border-border/40 p-3">
							<div className="text-muted-foreground">
								{isIndonesian ? "Total Log" : "Total Logs"}
							</div>
							<div className="mt-1 text-lg font-bold">
								{attendance.data?.totalLogs ?? 0}
							</div>
						</div>
						<div className="rounded-lg border border-border/40 p-3">
							<div className="text-muted-foreground">
								{isIndonesian ? "Hadir" : "Present"}
							</div>
							<div className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">
								{attendanceCount("present")}
							</div>
						</div>
						<div className="rounded-lg border border-border/40 p-3">
							<div className="text-muted-foreground">
								{isIndonesian ? "Terlambat" : "Late Minutes"}
							</div>
							<div className="mt-1 text-lg font-bold text-amber-600 dark:text-amber-400">
								{attendance.data?.totalLateMinutes ?? 0}
							</div>
						</div>
						<div className="rounded-lg border border-border/40 p-3">
							<div className="text-muted-foreground">
								{isIndonesian ? "Jam Efektif" : "Effective Hours"}
							</div>
							<div className="mt-1 text-lg font-bold">
								{Math.round(
									(attendance.data?.totalEffectiveWorkMinutes ?? 0) / 60,
								)}
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{canReadPayroll && (
				<Card className="overflow-hidden">
					<CardHeader>
						<CardTitle className="text-sm font-semibold">
							{isIndonesian ? "Tren Biaya Payroll" : "Payroll Cost Trend"}
						</CardTitle>
						<CardDescription className="text-xs">{year}</CardDescription>
					</CardHeader>
					<CardContent className="p-0">
						<Table>
							<TableHeader>
								<TableRow className="bg-muted/30">
									<TableHead className="text-xs">
										{isIndonesian ? "Periode" : "Period"}
									</TableHead>
									<TableHead className="text-center text-xs">Status</TableHead>
									<TableHead className="text-right text-xs">Karyawan</TableHead>
									<TableHead className="text-right text-xs">Bruto</TableHead>
									<TableHead className="text-right text-xs">PPh 21</TableHead>
									<TableHead className="text-right text-xs">Net Pay</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{(payrollTrend.data ?? []).length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={6}
											className="py-8 text-center text-xs text-muted-foreground"
										>
											{isIndonesian
												? "Belum ada periode payroll."
												: "No payroll periods yet."}
										</TableCell>
									</TableRow>
								) : (
									payrollTrend.data?.map((period) => (
										<TableRow key={period.id}>
											<TableCell className="text-xs font-medium">
												{period.name}
											</TableCell>
											<TableCell className="text-center">
												<Badge
													variant="outline"
													className="text-[10px] uppercase"
												>
													{period.status}
												</Badge>
											</TableCell>
											<TableCell className="text-right font-mono text-xs">
												{period.totalEmployees}
											</TableCell>
											<TableCell className="text-right font-mono text-xs">
												{formatRupiah(period.totalGross)}
											</TableCell>
											<TableCell className="text-right font-mono text-xs">
												{formatRupiah(period.totalPph21)}
											</TableCell>
											<TableCell className="text-right font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
												{formatRupiah(period.totalNetPay)}
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export const Route = createFileRoute("/_authenticated/analytics/")({
	component: AnalyticsPage,
});
