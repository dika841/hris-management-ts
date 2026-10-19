ALTER TABLE "employee" ADD COLUMN "work_schedule_type" text DEFAULT '5_days' NOT NULL;--> statement-breakpoint
ALTER TABLE "employee" ADD COLUMN "work_start_time" text DEFAULT '08:00' NOT NULL;--> statement-breakpoint
ALTER TABLE "employee" ADD COLUMN "work_end_time" text DEFAULT '17:00' NOT NULL;