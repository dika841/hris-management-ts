CREATE TABLE "ai_decision" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"feature" text NOT NULL,
	"subject_type" text,
	"subject_id" text,
	"prompt_hash" text NOT NULL,
	"model" text NOT NULL,
	"decision" jsonb NOT NULL,
	"confidence" integer NOT NULL,
	"risk_level" text NOT NULL,
	"status" text DEFAULT 'pending_review' NOT NULL,
	"redaction_applied" boolean DEFAULT true NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp with time zone,
	"review_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_decision" ADD CONSTRAINT "ai_decision_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_decision_status_created_idx" ON "ai_decision" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "ai_decision_feature_created_idx" ON "ai_decision" USING btree ("feature","created_at");