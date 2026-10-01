import {
	boolean,
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { employee } from "./employee.ts";

// ============================================================
// LEAVE TYPES - Jenis Cuti (UU 13/2003, UU KIA 2024, PP 35/2021)
// ============================================================
export const leaveType = pgTable("leave_type", {
	id: uuid("id").primaryKey().defaultRandom(),
	code: text("code").notNull().unique(),
	name: text("name").notNull(),
	category: text("category").notNull(), // "paid" | "unpaid" | "special_paid"
	description: text("description"),
	defaultDays: integer("default_days").notNull().default(0),
	requiresDoctorNote: boolean("requires_doctor_note").notNull().default(false),
	requiresSpouseNote: boolean("requires_spouse_note").notNull().default(false),
	genderRestriction: text("gender_restriction"),
	salaryPercentage: integer("salary_percentage").notNull().default(100),
	isActive: boolean("is_active").notNull().default(true),
	isSystem: boolean("is_system").notNull().default(false),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

// ============================================================
// LEAVE BALANCES - Saldo Cuti per Karyawan per Tahun
// ============================================================
export const leaveBalance = pgTable(
	"leave_balance",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		employeeId: uuid("employee_id")
			.notNull()
			.references(() => employee.id, { onDelete: "cascade" }),
		leaveTypeId: uuid("leave_type_id")
			.notNull()
			.references(() => leaveType.id, { onDelete: "cascade" }),
		year: integer("year").notNull(),
		allocatedDays: integer("allocated_days").notNull().default(0),
		carryOverDays: integer("carry_over_days").notNull().default(0),
		usedDays: integer("used_days").notNull().default(0),
		pendingDays: integer("pending_days").notNull().default(0),
		forfeitedDays: integer("forfeited_days").notNull().default(0),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		index("leave_balance_employee_year_idx").on(table.employeeId, table.year),
		index("leave_balance_type_idx").on(table.leaveTypeId),
	],
);

// ============================================================
// LEAVE REQUESTS - Pengajuan Cuti
// ============================================================
export const leaveRequest = pgTable(
	"leave_request",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		employeeId: uuid("employee_id")
			.notNull()
			.references(() => employee.id, { onDelete: "cascade" }),
		leaveTypeId: uuid("leave_type_id")
			.notNull()
			.references(() => leaveType.id),
		startDate: text("start_date").notNull(),
		endDate: text("end_date").notNull(),
		totalDays: integer("total_days").notNull(),
		reason: text("reason"),
		doctorNoteUrl: text("doctor_note_url"),
		attachmentUrl: text("attachment_url"),
		status: text("status").notNull().default("pending"),
		approverId: uuid("approver_id").references(() => employee.id, {
			onDelete: "set null",
		}),
		approvedAt: timestamp("approved_at", { withTimezone: true }),
		rejectionReason: text("rejection_reason"),
		salaryPercentageAtTime: integer("salary_percentage_at_time")
			.notNull()
			.default(100),
		notes: text("notes"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		index("leave_request_employee_idx").on(table.employeeId),
		index("leave_request_status_idx").on(table.status),
		index("leave_request_date_idx").on(table.startDate, table.endDate),
	],
);

// ============================================================
// ATTENDANCE LOGS - Catatan Presensi Harian
// ============================================================
export const attendanceLog = pgTable(
	"attendance_log",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		employeeId: uuid("employee_id")
			.notNull()
			.references(() => employee.id, { onDelete: "cascade" }),
		attendanceDate: text("attendance_date").notNull(),
		checkIn: timestamp("check_in", { withTimezone: true }),
		checkOut: timestamp("check_out", { withTimezone: true }),
		status: text("status").notNull().default("present"),
		// "present" | "sick" | "permitted" | "absent" | "holiday" | "leave" | "off"
		lateMinutes: integer("late_minutes").notNull().default(0),
		earlyDepartureMinutes: integer("early_departure_minutes")
			.notNull()
			.default(0),
		effectiveWorkMinutes: integer("effective_work_minutes")
			.notNull()
			.default(0),
		leaveRequestId: uuid("leave_request_id").references(() => leaveRequest.id, {
			onDelete: "set null",
		}),
		notes: text("notes"),
		isHoliday: boolean("is_holiday").notNull().default(false),
		holidayName: text("holiday_name"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		index("attendance_employee_date_idx").on(
			table.employeeId,
			table.attendanceDate,
		),
		index("attendance_status_idx").on(table.status),
	],
);

// ============================================================
// OVERTIME REQUESTS - Surat Perintah Lembur (SPL) PP 35/2021
// ============================================================
export const overtimeRequest = pgTable(
	"overtime_request",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		employeeId: uuid("employee_id")
			.notNull()
			.references(() => employee.id, { onDelete: "cascade" }),
		overtimeDate: text("overtime_date").notNull(),
		startTime: text("start_time").notNull(),
		endTime: text("end_time").notNull(),
		durationMinutes: integer("duration_minutes").notNull().default(0),
		dayType: text("day_type").notNull().default("workday"),
		// "workday" | "weekly_off" | "national_holiday"
		workScheduleType: text("work_schedule_type").notNull().default("5_days"),
		// "5_days" | "6_days"
		reason: text("reason"),
		taskDescription: text("task_description"),
		status: text("status").notNull().default("pending"),
		// "pending" | "approved" | "rejected" | "cancelled"
		approverId: uuid("approver_id").references(() => employee.id, {
			onDelete: "set null",
		}),
		approvedAt: timestamp("approved_at", { withTimezone: true }),
		rejectionReason: text("rejection_reason"),
		calculatedAmount: integer("calculated_amount").notNull().default(0),
		hourlyRate: integer("hourly_rate").notNull().default(0),
		isOverDailyLimit: boolean("is_over_daily_limit").notNull().default(false),
		isOverWeeklyLimit: boolean("is_over_weekly_limit").notNull().default(false),
		weeklyAccumulatedMinutes: integer("weekly_accumulated_minutes")
			.notNull()
			.default(0),
		notes: text("notes"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		index("overtime_employee_date_idx").on(
			table.employeeId,
			table.overtimeDate,
		),
		index("overtime_status_idx").on(table.status),
	],
);

// ============================================================
// PUBLIC HOLIDAYS - Hari Libur Nasional & Cuti Bersama
// ============================================================
export const publicHoliday = pgTable(
	"public_holiday",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		date: text("date").notNull().unique(),
		name: text("name").notNull(),
		type: text("type").notNull().default("national"),
		// "national" | "joint_leave"
		year: integer("year").notNull(),
		description: text("description"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		index("public_holiday_date_idx").on(table.date),
		index("public_holiday_year_idx").on(table.year),
	],
);
