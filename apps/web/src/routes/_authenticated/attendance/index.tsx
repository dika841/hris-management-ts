import { Guard } from "@app/components/guard/guard";
import { Button } from "@app/components/ui/button";
import { PERMISSION } from "@app/permissions";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Calendar,
	CalendarCheck,
	Clock,
	FileText,
	Plus,
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

const AttendancePage: FC = (): ReactElement => {
	const [activeTab, setActiveTab] = useState<
		"attendance" | "leave" | "overtime" | "holidays"
	>("attendance");
	const { t } = useI18n();

	const attendanceQuery = useAttendanceList({ page: 1, pageSize: 50 });
	const leaveQuery = useLeaveRequestList({ page: 1, pageSize: 50 });
	const overtimeQuery = useOvertimeList({ page: 1, pageSize: 50 });
	const holidayQuery = usePublicHolidayList({ year: 2026 });

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
			{activeTab === "attendance" && (
				<AttendanceTable list={attendanceQuery.data} />
			)}
			{activeTab === "leave" && <LeaveRequestTable list={leaveQuery.data} />}
			{activeTab === "overtime" && <OvertimeTable list={overtimeQuery.data} />}
			{activeTab === "holidays" && <HolidayTable list={holidayQuery.data} />}
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
				attendanceListOptions({ page: 1, pageSize: 50 }),
			),
			context.queryClient.ensureQueryData(
				leaveRequestListOptions({ page: 1, pageSize: 50 }),
			),
			context.queryClient.ensureQueryData(
				overtimeListOptions({ page: 1, pageSize: 50 }),
			),
			context.queryClient.ensureQueryData(
				publicHolidayListOptions({ year: 2026 }),
			),
		]),
	component: AttendancePage,
});
