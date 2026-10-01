import type { TBpjsBreakdown, TTaxBreakdown } from "@app/schemas";
import {
	doublePrecision,
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { employee } from "./employee.ts";

export const payrollPeriod = pgTable(
	"payroll_period",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		name: text("name").notNull(), // "September 2026"
		month: integer("month").notNull(),
		year: integer("year").notNull(),
		startDate: text("start_date").notNull(),
		endDate: text("end_date").notNull(),
		payDate: text("pay_date").notNull(),
		status: text("status").notNull().default("draft"),
		totalEmployees: integer("total_employees").notNull().default(0),
		totalGross: integer("total_gross").notNull().default(0),
		totalPph21: integer("total_pph21").notNull().default(0),
		totalNetPay: integer("total_net_pay").notNull().default(0),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		index("payroll_period_year_month_idx").on(table.year, table.month),
		index("payroll_period_status_idx").on(table.status),
	],
);

export const payrollItem = pgTable(
	"payroll_item",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		payrollPeriodId: uuid("payroll_period_id")
			.notNull()
			.references(() => payrollPeriod.id, { onDelete: "cascade" }),
		employeeId: uuid("employee_id")
			.notNull()
			.references(() => employee.id, { onDelete: "cascade" }),
		employeeCode: text("employee_code").notNull(),
		employeeName: text("employee_name").notNull(),
		department: text("department").notNull(),
		position: text("position").notNull(),
		// Komponen Gaji
		basicSalary: integer("basic_salary").notNull(),
		allowanceTotal: integer("allowance_total").notNull().default(0),
		overtimeHours: doublePrecision("overtime_hours").notNull().default(0),
		overtimePay: integer("overtime_pay").notNull().default(0),
		bonusTotal: integer("bonus_total").notNull().default(0),
		naturaTotal: integer("natura_total").notNull().default(0),
		taxAllowance: integer("tax_allowance").notNull().default(0),
		grossTotal: integer("gross_total").notNull().default(0),
		// Rincian JSON
		bpjsBreakdown: jsonb("bpjs_breakdown").$type<TBpjsBreakdown>().notNull(),
		taxBreakdown: jsonb("tax_breakdown").$type<TTaxBreakdown>().notNull(),
		deductionTotal: integer("deduction_total").notNull().default(0),
		netPay: integer("net_pay").notNull().default(0),
		calculationLog: text("calculation_log"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		index("payroll_item_period_idx").on(table.payrollPeriodId),
		index("payroll_item_employee_idx").on(table.employeeId),
	],
);

export const employeeTaxYtd = pgTable(
	"employee_tax_ytd",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		employeeId: uuid("employee_id")
			.notNull()
			.references(() => employee.id, { onDelete: "cascade" }),
		taxYear: integer("tax_year").notNull(),
		totalGross: integer("total_gross").notNull().default(0),
		totalPph21Paid: integer("total_pph21_paid").notNull().default(0),
		totalJhtEmployee: integer("total_jht_employee").notNull().default(0),
		totalJpEmployee: integer("total_jp_employee").notNull().default(0),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		index("tax_ytd_employee_year_idx").on(table.employeeId, table.taxYear),
	],
);
