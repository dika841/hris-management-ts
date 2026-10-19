ALTER TABLE "leave_request" DROP CONSTRAINT "leave_request_approver_id_employee_id_fk";
--> statement-breakpoint
ALTER TABLE "overtime_request" DROP CONSTRAINT "overtime_request_approver_id_employee_id_fk";
--> statement-breakpoint
ALTER TABLE "leave_request" ALTER COLUMN "approver_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "overtime_request" ALTER COLUMN "approver_id" SET DATA TYPE text;--> statement-breakpoint
UPDATE "leave_request" SET "approver_id" = "employee"."user_id" FROM "employee" WHERE "leave_request"."approver_id" = "employee"."id"::text AND "employee"."user_id" IS NOT NULL;--> statement-breakpoint
UPDATE "overtime_request" SET "approver_id" = "employee"."user_id" FROM "employee" WHERE "overtime_request"."approver_id" = "employee"."id"::text AND "employee"."user_id" IS NOT NULL;--> statement-breakpoint
UPDATE "leave_request" SET "approver_id" = NULL WHERE "approver_id" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "user" WHERE "user"."id" = "leave_request"."approver_id");--> statement-breakpoint
UPDATE "overtime_request" SET "approver_id" = NULL WHERE "approver_id" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "user" WHERE "user"."id" = "overtime_request"."approver_id");--> statement-breakpoint
ALTER TABLE "leave_request" ADD CONSTRAINT "leave_request_approver_id_user_id_fk" FOREIGN KEY ("approver_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "overtime_request" ADD CONSTRAINT "overtime_request_approver_id_user_id_fk" FOREIGN KEY ("approver_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;