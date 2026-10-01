CREATE TABLE "attendance_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"attendance_date" text NOT NULL,
	"check_in" timestamp with time zone,
	"check_out" timestamp with time zone,
	"status" text DEFAULT 'present' NOT NULL,
	"late_minutes" integer DEFAULT 0 NOT NULL,
	"early_departure_minutes" integer DEFAULT 0 NOT NULL,
	"effective_work_minutes" integer DEFAULT 0 NOT NULL,
	"leave_request_id" uuid,
	"notes" text,
	"is_holiday" boolean DEFAULT false NOT NULL,
	"holiday_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leave_balance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"leave_type_id" uuid NOT NULL,
	"year" integer NOT NULL,
	"allocated_days" integer DEFAULT 0 NOT NULL,
	"carry_over_days" integer DEFAULT 0 NOT NULL,
	"used_days" integer DEFAULT 0 NOT NULL,
	"pending_days" integer DEFAULT 0 NOT NULL,
	"forfeited_days" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leave_request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"leave_type_id" uuid NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text NOT NULL,
	"total_days" integer NOT NULL,
	"reason" text,
	"doctor_note_url" text,
	"attachment_url" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"approver_id" uuid,
	"approved_at" timestamp with time zone,
	"rejection_reason" text,
	"salary_percentage_at_time" integer DEFAULT 100 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leave_type" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"default_days" integer DEFAULT 0 NOT NULL,
	"requires_doctor_note" boolean DEFAULT false NOT NULL,
	"requires_spouse_note" boolean DEFAULT false NOT NULL,
	"gender_restriction" text,
	"salary_percentage" integer DEFAULT 100 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "leave_type_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "overtime_request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"overtime_date" text NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"duration_minutes" integer DEFAULT 0 NOT NULL,
	"day_type" text DEFAULT 'workday' NOT NULL,
	"work_schedule_type" text DEFAULT '5_days' NOT NULL,
	"reason" text,
	"task_description" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"approver_id" uuid,
	"approved_at" timestamp with time zone,
	"rejection_reason" text,
	"calculated_amount" integer DEFAULT 0 NOT NULL,
	"hourly_rate" integer DEFAULT 0 NOT NULL,
	"is_over_daily_limit" boolean DEFAULT false NOT NULL,
	"is_over_weekly_limit" boolean DEFAULT false NOT NULL,
	"weekly_accumulated_minutes" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "public_holiday" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" text NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'national' NOT NULL,
	"year" integer NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "public_holiday_date_unique" UNIQUE("date")
);
--> statement-breakpoint
ALTER TABLE "attendance_log" ADD CONSTRAINT "attendance_log_employee_id_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_log" ADD CONSTRAINT "attendance_log_leave_request_id_leave_request_id_fk" FOREIGN KEY ("leave_request_id") REFERENCES "public"."leave_request"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_balance" ADD CONSTRAINT "leave_balance_employee_id_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_balance" ADD CONSTRAINT "leave_balance_leave_type_id_leave_type_id_fk" FOREIGN KEY ("leave_type_id") REFERENCES "public"."leave_type"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_request" ADD CONSTRAINT "leave_request_employee_id_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_request" ADD CONSTRAINT "leave_request_leave_type_id_leave_type_id_fk" FOREIGN KEY ("leave_type_id") REFERENCES "public"."leave_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_request" ADD CONSTRAINT "leave_request_approver_id_employee_id_fk" FOREIGN KEY ("approver_id") REFERENCES "public"."employee"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "overtime_request" ADD CONSTRAINT "overtime_request_employee_id_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "overtime_request" ADD CONSTRAINT "overtime_request_approver_id_employee_id_fk" FOREIGN KEY ("approver_id") REFERENCES "public"."employee"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attendance_employee_date_idx" ON "attendance_log" USING btree ("employee_id","attendance_date");--> statement-breakpoint
CREATE INDEX "attendance_status_idx" ON "attendance_log" USING btree ("status");--> statement-breakpoint
CREATE INDEX "leave_balance_employee_year_idx" ON "leave_balance" USING btree ("employee_id","year");--> statement-breakpoint
CREATE INDEX "leave_balance_type_idx" ON "leave_balance" USING btree ("leave_type_id");--> statement-breakpoint
CREATE INDEX "leave_request_employee_idx" ON "leave_request" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "leave_request_status_idx" ON "leave_request" USING btree ("status");--> statement-breakpoint
CREATE INDEX "leave_request_date_idx" ON "leave_request" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "overtime_employee_date_idx" ON "overtime_request" USING btree ("employee_id","overtime_date");--> statement-breakpoint
CREATE INDEX "overtime_status_idx" ON "overtime_request" USING btree ("status");--> statement-breakpoint
CREATE INDEX "public_holiday_date_idx" ON "public_holiday" USING btree ("date");--> statement-breakpoint
CREATE INDEX "public_holiday_year_idx" ON "public_holiday" USING btree ("year");