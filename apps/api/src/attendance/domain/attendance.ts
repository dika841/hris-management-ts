import type {
	TAttendanceBulkLogInput,
	TAttendanceListInput,
	TAttendanceStatus,
	TAttendanceSummary,
	TLeaveCategory,
	TLeaveRequestListInput,
	TLeaveRequestStatus,
	TOvertimeDayType,
	TOvertimeListInput,
	TOvertimeStatus,
	TPublicHolidayType,
	TWorkScheduleType,
} from "@app/schemas";
import { Context, type Effect } from "effect";
import type { TBaseRow } from "#/shared/base-row.ts";
import type { EDatabase } from "#/shared/errors.ts";
import type { TRowPage } from "#/shared/pagination.ts";
import { REPO_TAG } from "#/shared/repo-tags.ts";
import type { TServiceId } from "#/shared/service-id.ts";

// ============================================================
// ROW TYPES
// ============================================================
export type TLeaveTypeRow = TBaseRow & {
	code: string;
	name: string;
	category: TLeaveCategory;
	description: string | null;
	defaultDays: number;
	requiresDoctorNote: boolean;
	requiresSpouseNote: boolean;
	genderRestriction: "male" | "female" | null;
	salaryPercentage: number;
	isActive: boolean;
	isSystem: boolean;
};

export type TLeaveBalanceRow = TBaseRow & {
	employeeId: string;
	leaveTypeId: string;
	year: number;
	allocatedDays: number;
	carryOverDays: number;
	usedDays: number;
	pendingDays: number;
	forfeitedDays: number;
};

export type TLeaveRequestRow = TBaseRow & {
	employeeId: string;
	leaveTypeId: string;
	startDate: string;
	endDate: string;
	totalDays: number;
	reason: string | null;
	doctorNoteUrl: string | null;
	attachmentUrl: string | null;
	status: TLeaveRequestStatus;
	approverId: string | null;
	approvedAt: Date | null;
	rejectionReason: string | null;
	salaryPercentageAtTime: number;
	notes: string | null;
};

export type TAttendanceLogRow = TBaseRow & {
	employeeId: string;
	attendanceDate: string;
	checkIn: Date | null;
	checkOut: Date | null;
	status: TAttendanceStatus;
	lateMinutes: number;
	earlyDepartureMinutes: number;
	effectiveWorkMinutes: number;
	leaveRequestId: string | null;
	notes: string | null;
	isHoliday: boolean;
	holidayName: string | null;
};

export type TOvertimeRequestRow = TBaseRow & {
	employeeId: string;
	overtimeDate: string;
	startTime: string;
	endTime: string;
	durationMinutes: number;
	dayType: TOvertimeDayType;
	workScheduleType: TWorkScheduleType;
	reason: string | null;
	taskDescription: string | null;
	status: TOvertimeStatus;
	approverId: string | null;
	approvedAt: Date | null;
	rejectionReason: string | null;
	calculatedAmount: number;
	hourlyRate: number;
	isOverDailyLimit: boolean;
	isOverWeeklyLimit: boolean;
	weeklyAccumulatedMinutes: number;
	notes: string | null;
};

export type TPublicHolidayRow = {
	id: string;
	date: string;
	name: string;
	type: TPublicHolidayType;
	year: number;
	description: string | null;
	createdAt: Date;
};

// ============================================================
// REPOSITORY INTERFACE
// ============================================================
export type TAttendanceRepo = {
	// Leave Types
	listLeaveTypes: () => Effect.Effect<readonly TLeaveTypeRow[], EDatabase>;
	findLeaveTypeById: (
		id: string,
	) => Effect.Effect<TLeaveTypeRow | null, EDatabase>;
	findLeaveTypeByCode: (
		code: string,
	) => Effect.Effect<TLeaveTypeRow | null, EDatabase>;
	createLeaveType: (
		data: Omit<TLeaveTypeRow, "id" | "createdAt" | "updatedAt">,
	) => Effect.Effect<TLeaveTypeRow, EDatabase>;
	updateLeaveType: (
		id: string,
		patch: Partial<TLeaveTypeRow>,
	) => Effect.Effect<TLeaveTypeRow | null, EDatabase>;

	// Leave Balances
	listLeaveBalances: (
		employeeId: string,
		year: number,
	) => Effect.Effect<readonly TLeaveBalanceRow[], EDatabase>;
	findLeaveBalance: (
		employeeId: string,
		leaveTypeId: string,
		year: number,
	) => Effect.Effect<TLeaveBalanceRow | null, EDatabase>;
	upsertLeaveBalance: (
		data: Omit<TLeaveBalanceRow, "id" | "createdAt" | "updatedAt">,
	) => Effect.Effect<TLeaveBalanceRow, EDatabase>;
	updateLeaveBalance: (
		id: string,
		patch: Partial<TLeaveBalanceRow>,
	) => Effect.Effect<TLeaveBalanceRow | null, EDatabase>;
	forfeitExpiredCarryOver: (year: number) => Effect.Effect<number, EDatabase>; // returns count forfeited

	// Leave Requests
	listLeaveRequests: (
		input: TLeaveRequestListInput,
	) => Effect.Effect<TRowPage<TLeaveRequestRow>, EDatabase>;
	findLeaveRequestById: (
		id: string,
	) => Effect.Effect<TLeaveRequestRow | null, EDatabase>;
	createLeaveRequest: (
		data: Omit<TLeaveRequestRow, "id" | "createdAt" | "updatedAt">,
	) => Effect.Effect<TLeaveRequestRow, EDatabase>;
	updateLeaveRequest: (
		id: string,
		patch: Partial<TLeaveRequestRow>,
	) => Effect.Effect<TLeaveRequestRow | null, EDatabase>;
	countOverlappingLeaveRequests: (
		employeeId: string,
		startDate: string,
		endDate: string,
		excludeId?: string,
	) => Effect.Effect<number, EDatabase>;

	// Attendance Logs
	listAttendanceLogs: (
		input: TAttendanceListInput,
	) => Effect.Effect<TRowPage<TAttendanceLogRow>, EDatabase>;
	findAttendanceLog: (
		employeeId: string,
		date: string,
	) => Effect.Effect<TAttendanceLogRow | null, EDatabase>;
	upsertAttendanceLog: (
		data: Omit<TAttendanceLogRow, "id" | "createdAt" | "updatedAt">,
	) => Effect.Effect<TAttendanceLogRow, EDatabase>;
	bulkUpsertAttendanceLogs: (
		input: TAttendanceBulkLogInput,
	) => Effect.Effect<readonly TAttendanceLogRow[], EDatabase>;
	getAttendanceSummary: (
		employeeId: string,
		month: number,
		year: number,
	) => Effect.Effect<TAttendanceSummary, EDatabase>;

	// Overtime
	listOvertimeRequests: (
		input: TOvertimeListInput,
	) => Effect.Effect<TRowPage<TOvertimeRequestRow>, EDatabase>;
	findOvertimeById: (
		id: string,
	) => Effect.Effect<TOvertimeRequestRow | null, EDatabase>;
	createOvertimeRequest: (
		data: Omit<TOvertimeRequestRow, "id" | "createdAt" | "updatedAt">,
	) => Effect.Effect<TOvertimeRequestRow, EDatabase>;
	updateOvertimeRequest: (
		id: string,
		patch: Partial<TOvertimeRequestRow>,
	) => Effect.Effect<TOvertimeRequestRow | null, EDatabase>;
	getWeeklyOvertimeMinutes: (
		employeeId: string,
		weekStart: string,
		weekEnd: string,
		excludeId?: string,
	) => Effect.Effect<number, EDatabase>;

	// Public Holidays
	listPublicHolidays: (
		year?: number,
	) => Effect.Effect<readonly TPublicHolidayRow[], EDatabase>;
	findHolidayByDate: (
		date: string,
	) => Effect.Effect<TPublicHolidayRow | null, EDatabase>;
	createPublicHoliday: (
		data: Omit<TPublicHolidayRow, "id" | "createdAt">,
	) => Effect.Effect<TPublicHolidayRow, EDatabase>;
	deletePublicHoliday: (id: string) => Effect.Effect<boolean, EDatabase>;
};

export type TAttendanceRepoId = TServiceId<typeof REPO_TAG.ATTENDANCE>;

export const AttendanceRepo = Context.Service<
	TAttendanceRepoId,
	TAttendanceRepo
>(REPO_TAG.ATTENDANCE);
