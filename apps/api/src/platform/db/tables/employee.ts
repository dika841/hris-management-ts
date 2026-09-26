import {
	boolean,
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth.ts";

export const department = pgTable("department", {
	id: uuid("id").primaryKey().defaultRandom(),
	code: text("code").notNull().unique(),
	name: text("name").notNull(),
	description: text("description"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const position = pgTable("position", {
	id: uuid("id").primaryKey().defaultRandom(),
	departmentId: uuid("department_id").references(() => department.id, {
		onDelete: "set null",
	}),
	code: text("code").notNull().unique(),
	title: text("title").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const employee = pgTable(
	"employee",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: text("user_id").references(() => user.id, {
			onDelete: "set null",
		}),
		employeeCode: text("employee_code").notNull().unique(),
		idCardNumber: text("id_card_number").notNull(), // NIK KTP
		fullName: text("full_name").notNull(),
		email: text("email").notNull().unique(),
		phone: text("phone"),
		gender: text("gender").notNull(), // "male" | "female"
		dateOfBirth: text("date_of_birth").notNull(), // YYYY-MM-DD
		department: text("department").notNull(),
		position: text("position").notNull(),
		employmentStatus: text("employment_status").notNull().default("permanent"),
		joinDate: text("join_date").notNull(), // YYYY-MM-DD
		endDate: text("end_date"),
		managerId: uuid("manager_id"),
		// Finansial & Penggajian
		basicSalary: integer("basic_salary").notNull().default(0),
		taxMethod: text("tax_method").notNull().default("gross"),
		ptkpCode: text("ptkp_code").notNull().default("TK/0"),
		npwp: text("npwp"),
		bankName: text("bank_name"),
		bankAccountNumber: text("bank_account_number"),
		bankAccountHolder: text("bank_account_holder"),
		// BPJS
		bpjsKesehatanNumber: text("bpjs_kesehatan_number"),
		bpjsKetenagakerjaanNumber: text("bpjs_ketenagakerjaan_number"),
		jkkRiskGrade: integer("jkk_risk_grade").notNull().default(1),
		// UU PDP
		pdpConsentGiven: boolean("pdp_consent_given").notNull().default(true),
		pdpConsentDate: timestamp("pdp_consent_date", { withTimezone: true })
			.notNull()
			.defaultNow(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		index("employee_code_idx").on(table.employeeCode),
		index("employee_email_idx").on(table.email),
		index("employee_department_idx").on(table.department),
	],
);

export const employeeContract = pgTable(
	"employee_contract",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		employeeId: uuid("employee_id")
			.notNull()
			.references(() => employee.id, { onDelete: "cascade" }),
		contractType: text("contract_type").notNull(), // "pkwt" | "pkwtt" | "internship" | "freelance"
		contractNumber: text("contract_number").notNull().unique(),
		startDate: text("start_date").notNull(), // YYYY-MM-DD
		endDate: text("end_date"), // YYYY-MM-DD (null for pkwtt)
		probationEndDate: text("probation_end_date"), // YYYY-MM-DD (forbidden for pkwt, allowed only for pkwtt)
		basicSalary: integer("basic_salary").notNull(),
		fixedAllowance: integer("fixed_allowance").notNull().default(0),
		position: text("position").notNull(),
		department: text("department").notNull(),
		status: text("status").notNull().default("active"), // "active" | "renewed" | "converted" | "expired" | "terminated"
		compensationAmount: integer("compensation_amount").notNull().default(0), // Uang Kompensasi PKWT PP 35/2021
		compensationPaid: boolean("compensation_paid").notNull().default(false),
		compensationPaidAt: timestamp("compensation_paid_at", { withTimezone: true }),
		documentUrl: text("document_url"),
		notes: text("notes"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		index("contract_employee_idx").on(table.employeeId),
		index("contract_status_idx").on(table.status),
		index("contract_end_date_idx").on(table.endDate),
	],
);

export const employeeCareerHistory = pgTable(
	"employee_career_history",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		employeeId: uuid("employee_id")
			.notNull()
			.references(() => employee.id, { onDelete: "cascade" }),
		changeType: text("change_type").notNull(), // "hire" | "promotion" | "demotion" | "mutation" | "salary_adjustment"
		effectiveDate: text("effective_date").notNull(), // YYYY-MM-DD
		previousDepartment: text("previous_department"),
		newDepartment: text("new_department").notNull(),
		previousPosition: text("previous_position"),
		newPosition: text("new_position").notNull(),
		previousSalary: integer("previous_salary"),
		newSalary: integer("new_salary").notNull(),
		notes: text("notes"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		index("career_employee_idx").on(table.employeeId),
		index("career_effective_date_idx").on(table.effectiveDate),
	],
);
