-- migration-safety: contract-and-career-tables
CREATE TABLE "employee_career_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"change_type" text NOT NULL,
	"effective_date" text NOT NULL,
	"previous_department" text,
	"new_department" text NOT NULL,
	"previous_position" text,
	"new_position" text NOT NULL,
	"previous_salary" integer,
	"new_salary" integer NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee_contract" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"contract_type" text NOT NULL,
	"contract_number" text NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text,
	"probation_end_date" text,
	"basic_salary" integer NOT NULL,
	"fixed_allowance" integer DEFAULT 0 NOT NULL,
	"position" text NOT NULL,
	"department" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"compensation_amount" integer DEFAULT 0 NOT NULL,
	"compensation_paid" boolean DEFAULT false NOT NULL,
	"compensation_paid_at" timestamp with time zone,
	"document_url" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "employee_contract_contract_number_unique" UNIQUE("contract_number")
);
--> statement-breakpoint
ALTER TABLE "employee" ADD COLUMN "manager_id" uuid;--> statement-breakpoint
ALTER TABLE "employee_career_history" ADD CONSTRAINT "employee_career_history_employee_id_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_contract" ADD CONSTRAINT "employee_contract_employee_id_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "career_employee_idx" ON "employee_career_history" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "career_effective_date_idx" ON "employee_career_history" USING btree ("effective_date");--> statement-breakpoint
CREATE INDEX "contract_employee_idx" ON "employee_contract" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "contract_status_idx" ON "employee_contract" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contract_end_date_idx" ON "employee_contract" USING btree ("end_date");