-- migration-safety: contract-phase
CREATE TABLE "department" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "department_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "employee" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"employee_code" text NOT NULL,
	"id_card_number" text NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"gender" text NOT NULL,
	"date_of_birth" text NOT NULL,
	"department" text NOT NULL,
	"position" text NOT NULL,
	"employment_status" text DEFAULT 'permanent' NOT NULL,
	"join_date" text NOT NULL,
	"end_date" text,
	"basic_salary" integer DEFAULT 0 NOT NULL,
	"tax_method" text DEFAULT 'gross' NOT NULL,
	"ptkp_code" text DEFAULT 'TK/0' NOT NULL,
	"npwp" text,
	"bank_name" text,
	"bank_account_number" text,
	"bank_account_holder" text,
	"bpjs_kesehatan_number" text,
	"bpjs_ketenagakerjaan_number" text,
	"jkk_risk_grade" integer DEFAULT 1 NOT NULL,
	"pdp_consent_given" boolean DEFAULT true NOT NULL,
	"pdp_consent_date" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "employee_employee_code_unique" UNIQUE("employee_code"),
	CONSTRAINT "employee_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "position" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"department_id" uuid,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "position_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "employee_tax_ytd" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"tax_year" integer NOT NULL,
	"total_gross" integer DEFAULT 0 NOT NULL,
	"total_pph21_paid" integer DEFAULT 0 NOT NULL,
	"total_jht_employee" integer DEFAULT 0 NOT NULL,
	"total_jp_employee" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payroll_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payroll_period_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"employee_code" text NOT NULL,
	"employee_name" text NOT NULL,
	"department" text NOT NULL,
	"position" text NOT NULL,
	"basic_salary" integer NOT NULL,
	"allowance_total" integer DEFAULT 0 NOT NULL,
	"overtime_hours" double precision DEFAULT 0 NOT NULL,
	"overtime_pay" integer DEFAULT 0 NOT NULL,
	"bonus_total" integer DEFAULT 0 NOT NULL,
	"natura_total" integer DEFAULT 0 NOT NULL,
	"tax_allowance" integer DEFAULT 0 NOT NULL,
	"gross_total" integer DEFAULT 0 NOT NULL,
	"bpjs_breakdown" jsonb NOT NULL,
	"tax_breakdown" jsonb NOT NULL,
	"deduction_total" integer DEFAULT 0 NOT NULL,
	"net_pay" integer DEFAULT 0 NOT NULL,
	"calculation_log" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payroll_period" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text NOT NULL,
	"pay_date" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"total_employees" integer DEFAULT 0 NOT NULL,
	"total_gross" integer DEFAULT 0 NOT NULL,
	"total_pph21" integer DEFAULT 0 NOT NULL,
	"total_net_pay" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "note" CASCADE;--> statement-breakpoint
ALTER TABLE "employee" ADD CONSTRAINT "employee_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "position" ADD CONSTRAINT "position_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_tax_ytd" ADD CONSTRAINT "employee_tax_ytd_employee_id_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_item" ADD CONSTRAINT "payroll_item_payroll_period_id_payroll_period_id_fk" FOREIGN KEY ("payroll_period_id") REFERENCES "public"."payroll_period"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_item" ADD CONSTRAINT "payroll_item_employee_id_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "employee_code_idx" ON "employee" USING btree ("employee_code");--> statement-breakpoint
CREATE INDEX "employee_email_idx" ON "employee" USING btree ("email");--> statement-breakpoint
CREATE INDEX "employee_department_idx" ON "employee" USING btree ("department");--> statement-breakpoint
CREATE INDEX "tax_ytd_employee_year_idx" ON "employee_tax_ytd" USING btree ("employee_id","tax_year");--> statement-breakpoint
CREATE INDEX "payroll_item_period_idx" ON "payroll_item" USING btree ("payroll_period_id");--> statement-breakpoint
CREATE INDEX "payroll_item_employee_idx" ON "payroll_item" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "payroll_period_year_month_idx" ON "payroll_period" USING btree ("year","month");--> statement-breakpoint
CREATE INDEX "payroll_period_status_idx" ON "payroll_period" USING btree ("status");