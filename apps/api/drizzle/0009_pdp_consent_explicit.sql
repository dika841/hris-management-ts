ALTER TABLE "employee" ALTER COLUMN "pdp_consent_given" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "employee" ALTER COLUMN "pdp_consent_date" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "employee" ALTER COLUMN "pdp_consent_date" DROP NOT NULL;