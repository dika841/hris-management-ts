import { Guard } from "@app/components/guard/guard";
import { Button } from "@app/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@app/components/ui/select";
import { PERMISSION } from "@app/permissions";
import { ATTENDANCE_STATUS, type TAttendanceStatus } from "@app/schemas";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	BarChart3,
	Calendar,
	CalendarCheck,
	Clock,
	FileText,
	Plus,
	Settings,
	Sparkles,
} from "lucide-react";
import { useState, type FC, type ReactElement } from "react";
import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import { useI18n } from "#/libs/i18n/index.ts";
import { AttendanceTable } from "./_components/attendance-table.tsx";
import { HolidayTable } from "./_components/holiday-table.tsx";
import { LeaveRequestTable } from "./_components/leave-request-table.tsx";
import { OvertimeTable } from "./_components/overtime-table.tsx";
import {
	attendanceListOptions,
	leaveRequestListOptions,
	overtimeListOptions,
	publicHolidayListOptions,
	useAttendanceList,
	useLeaveRequestList,
	useOvertimeList,
	usePublicHolidayList,
} from "./_hooks/use-attendance.ts";

const PAGE_SIZE = 20;
const CURRENT_YEAR = new Date().getFullYear();

type TTab = "attendance" | "leave" | "overtime" | "holidays";
type TPagedTab = Exclude<TTab, "holidays">;

const AttendancePage: FC = (): ReactElement => {
	const [activeTab, setActiveTab] = useState<TTab>("attendance");
	const [attendanceStatus, setAttendanceStatus] = useState<
		TAttendanceStatus | "all"
	>("all");
	const [pages, setPages] = useState<Record<TPagedTab, number>>({
		attendance: 1,
		leave: 1,
		overtime: 1,
	});
	const { t, isIndonesian } = useI18n();

	const attendanceQuery = useAttendanceList({
		page: pages.attendance,
		pageSize: PAGE_SIZE,
		status: attendanceStatus === "all" ? undefined : attendanceStatus,
	});
	const leaveQuery = useLeaveRequestList({
		page: pages.leave,
		pageSize: PAGE_SIZE,
	});
	const overtimeQuery = useOvertimeList({
		page: pages.overtime,
		pageSize: PAGE_SIZE,
	});
	const holidayQuery = usePublicHolidayList({ year: CURRENT_YEAR });

	const activePagedTab =
		activeTab === "holidays" ? null : (activeTab as TPagedTab);
	const activeTotal =
		activeTab === "attendance"
			? attendanceQuery.data.total
			: activeTab === "leave"
				? leaveQuery.data.total
				: activeTab === "overtime"
					? overtimeQuery.data.total
					: holidayQuery.data.length;
	const activePage = activePagedTab ? pages[activePagedTab] : 1;
	const pageCount = Math.max(1, Math.ceil(activeTotal / PAGE_SIZE));

	const goToPage = (page: number): void => {
		if (activePagedTab === null) return;
		setPages((prev) => ({ ...prev, [activePagedTab]: page }));
	};

	return (
		<div className="flex flex-col gap-6">
			{/* Page Header */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
				<div>
					<div className="flex items-center gap-2">
						<div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
							<CalendarCheck className="size-4.5" />
						</div>
						<h1 className="text-xl font-bold tracking-tight text-foreground">
							{t("attendance.title")}
						</h1>
					</div>
					<p className="mt-1 text-xs text-muted-foreground">
						{t("attendance.subtitle")}
					</p>
				</div>

				{/* Primary Action Button (Navigates to dedicated full page) */}
				<div className="flex items-center gap-2">
					<Button
						size="sm"
						variant="outline"
						asChild
						className="gap-1.5 text-xs font-medium"
					>
						<Link to="/attendance/report">
							<BarChart3 className="size-3.5" />
							Rekap Absensi
						</Link>
					</Button>
					<Guard permissions={[PERMISSION.LEAVE_MANAGE]}>
						<Button
							size="sm"
							variant="outline"
							asChild
							className="gap-1.5 text-xs font-medium"
						>
							<Link to="/attendance/settings">
								<Settings className="size-3.5" />
								Pengaturan Cuti
							</Link>
						</Button>
					</Guard>
					{activeTab === "attendance" && (
						<Guard permissions={[PERMISSION.ATTENDANCE_MANAGE]}>
							<Button
								size="sm"
								asChild
								className="gap-1.5 text-xs font-semibold"
							>
								<Link to="/attendance/log/create">
									<Plus className="size-3.5" />
									{t("attendance.actions.recordAttendance")}
								</Link>
							</Button>
						</Guard>
					)}

					{activeTab === "leave" && (
						<Guard permissions={[PERMISSION.LEAVE_MANAGE]}>
							<Button
								size="sm"
								asChild
								className="gap-1.5 text-xs font-semibold"
							>
								<Link to="/attendance/leave/create">
									<Plus className="size-3.5" />
									{t("attendance.actions.requestLeave")}
								</Link>
							</Button>
						</Guard>
					)}

					{activeTab === "overtime" && (
						<Guard permissions={[PERMISSION.OVERTIME_MANAGE]}>
							<Button
								size="sm"
								asChild
								className="gap-1.5 text-xs font-semibold"
							>
								<Link to="/attendance/overtime/create">
									<Plus className="size-3.5" />
									{t("attendance.actions.createOvertime")}
								</Link>
							</Button>
						</Guard>
					)}

					{activeTab === "holidays" && (
						<Guard permissions={[PERMISSION.ATTENDANCE_MANAGE]}>
							<Button
								size="sm"
								asChild
								className="gap-1.5 text-xs font-semibold"
							>
								<Link to="/attendance/holiday/create">
									<Plus className="size-3.5" />
									{t("attendance.actions.addHoliday")}
								</Link>
							</Button>
						</Guard>
					)}
				</div>
			</div>

			{/* Sub Navigation Tabs */}
			<div className="flex items-center gap-2 border-b border-border/40 pb-2">
				<Button
					variant={activeTab === "attendance" ? "secondary" : "ghost"}
					size="sm"
					onClick={() => setActiveTab("attendance")}
					className="text-xs font-medium gap-1.5"
				>
					<Clock className="size-3.5" />
					{t("attendance.tabs.attendance")} ({attendanceQuery.data.items.length}
					)
				</Button>
				<Button
					variant={activeTab === "leave" ? "secondary" : "ghost"}
					size="sm"
					onClick={() => setActiveTab("leave")}
					className="text-xs font-medium gap-1.5"
				>
					<FileText className="size-3.5" />
					{t("attendance.tabs.leave")} ({leaveQuery.data.items.length})
				</Button>
				<Button
					variant={activeTab === "overtime" ? "secondary" : "ghost"}
					size="sm"
					onClick={() => setActiveTab("overtime")}
					className="text-xs font-medium gap-1.5"
				>
					<Sparkles className="size-3.5" />
					{t("attendance.tabs.overtime")} ({overtimeQuery.data.items.length})
				</Button>
				<Button
					variant={activeTab === "holidays" ? "secondary" : "ghost"}
					size="sm"
					onClick={() => setActiveTab("holidays")}
					className="text-xs font-medium gap-1.5"
				>
					<Calendar className="size-3.5" />
					{t("attendance.tabs.holidays")} ({holidayQuery.data.length})
				</Button>
			</div>

			{/* Active Tab Content */}
			{/* Active Tab Content */}
			{activeTab === "attendance" && (
				<div className="flex flex-col gap-3">
					<div className="flex items-center justify-end">
						<Select
							value={attendanceStatus}
							onValueChange={(value) => {
								setAttendanceStatus(value as TAttendanceStatus | "all");
								setPages((prev) => ({ ...prev, attendance: 1 }));
							}}
						>
							<SelectTrigger className="h-8 w-44 text-xs">
								<SelectValue placeholder="Semua status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									{isIndonesian ? "Semua status" : "All statuses"}
								</SelectItem>
								<SelectItem value={ATTENDANCE_STATUS.PRESENT}>
									{isIndonesian ? "Hadir" : "Present"}
								</SelectItem>
								<SelectItem value={ATTENDANCE_STATUS.SICK}>
									{isIndonesian ? "Sakit" : "Sick"}
								</SelectItem>
								<SelectItem value={ATTENDANCE_STATUS.PERMITTED}>
									{isIndonesian ? "Izin" : "Permitted"}
								</SelectItem>
								<SelectItem value={ATTENDANCE_STATUS.ABSENT}>
									{isIndonesian ? "Mangkir" : "Absent"}
								</SelectItem>
								<SelectItem value={ATTENDANCE_STATUS.LEAVE}>
									{isIndonesian ? "Cuti" : "Leave"}
								</SelectItem>
								<SelectItem value={ATTENDANCE_STATUS.OFF}>
									{isIndonesian ? "Libur" : "Off"}
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<AttendanceTable list={attendanceQuery.data} />
				</div>
			)}
			{activeTab === "leave" && <LeaveRequestTable list={leaveQuery.data} />}
			{activeTab === "overtime" && <OvertimeTable list={overtimeQuery.data} />}
			{activeTab === "holidays" && <HolidayTable list={holidayQuery.data} />}

			{activePagedTab !== null && (
				<div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
					<span>
						{activeTotal === 0
							? isIndonesian
								? "0 data"
								: "0 records"
							: `${(activePage - 1) * PAGE_SIZE + 1}-${Math.min(activePage * PAGE_SIZE, activeTotal)} ${isIndonesian ? "dari" : "of"} ${activeTotal}`}
					</span>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={activePage <= 1}
							onClick={() => goToPage(activePage - 1)}
							className="h-7 text-xs"
						>
							{isIndonesian ? "Sebelumnya" : "Previous"}
						</Button>
						<span className="font-mono">
							{activePage}/{pageCount}
						</span>
						<Button
							variant="outline"
							size="sm"
							disabled={activePage >= pageCount}
							onClick={() => goToPage(activePage + 1)}
							className="h-7 text-xs"
						>
							{isIndonesian ? "Berikutnya" : "Next"}
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};

export const Route = createFileRoute("/_authenticated/attendance/")({
	beforeLoad: checkRoutePermissions({
		permissions: [PERMISSION.ATTENDANCE_READ],
	}),
	loader: ({ context }) =>
		Promise.all([
			context.queryClient.ensureQueryData(
				attendanceListOptions({ page: 1, pageSize: PAGE_SIZE }),
			),
			context.queryClient.ensureQueryData(
				leaveRequestListOptions({ page: 1, pageSize: PAGE_SIZE }),
			),
			context.queryClient.ensureQueryData(
				overtimeListOptions({ page: 1, pageSize: PAGE_SIZE }),
			),
			context.queryClient.ensureQueryData(
				publicHolidayListOptions({ year: CURRENT_YEAR }),
			),
		]),
	component: AttendancePage,
});
