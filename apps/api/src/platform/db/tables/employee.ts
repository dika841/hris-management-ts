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
		gender: text("gender").notNull(), // 'male' | 'female'
		dateOfBirth: text("date_of_birth").notNull(), // YYYY-MM-DD
		department: text("department").notNull(),
		position: text("position").notNull(),
		employmentStatus: text("employment_status").notNull().default("permanent"),
		joinDate: text("join_date").notNull(), // YYYY-MM-DD
		endDate: text("end_date"),
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
