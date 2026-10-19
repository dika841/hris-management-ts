CREATE TABLE "payroll_component" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payroll_period_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"type" text NOT NULL,
	"amount" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payroll_component" ADD CONSTRAINT "payroll_component_payroll_period_id_payroll_period_id_fk" FOREIGN KEY ("payroll_period_id") REFERENCES "public"."payroll_period"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_component" ADD CONSTRAINT "payroll_component_employee_id_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "payroll_component_period_idx" ON "payroll_component" USING btree ("payroll_period_id");--> statement-breakpoint
CREATE INDEX "payroll_component_employee_idx" ON "payroll_component" USING btree ("employee_id");