ALTER TABLE "employee" ADD COLUMN "department_id" uuid;--> statement-breakpoint
ALTER TABLE "employee" ADD COLUMN "position_id" uuid;--> statement-breakpoint
ALTER TABLE "employee" ADD CONSTRAINT "employee_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee" ADD CONSTRAINT "employee_position_id_position_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."position"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
UPDATE "employee" SET "department_id" = "department"."id" FROM "department" WHERE "employee"."department" = "department"."name" AND "employee"."department_id" IS NULL;--> statement-breakpoint
UPDATE "employee" SET "position_id" = "position"."id" FROM "position" WHERE "employee"."position" = "position"."title" AND "employee"."position_id" IS NULL;--> statement-breakpoint
UPDATE "employee" SET "user_id" = NULL WHERE "id" IN (SELECT "id" FROM (SELECT "id", ROW_NUMBER() OVER (PARTITION BY "user_id" ORDER BY "created_at", "id") AS "row_number" FROM "employee" WHERE "user_id" IS NOT NULL) AS "duplicates" WHERE "row_number" > 1);--> statement-breakpoint
CREATE UNIQUE INDEX "employee_user_id_idx" ON "employee" USING btree ("user_id");