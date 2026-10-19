import {
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth.ts";

export const aiDecision = pgTable(
	"ai_decision",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		feature: text("feature").notNull(),
		subjectType: text("subject_type"),
		subjectId: text("subject_id"),
		promptHash: text("prompt_hash").notNull(),
		model: text("model").notNull(),
		decision: jsonb("decision").notNull(),
		confidence: integer("confidence").notNull(),
		riskLevel: text("risk_level").notNull(),
		status: text("status").notNull().default("pending_review"),
		redactionApplied: boolean("redaction_applied").notNull().default(true),
		reviewedBy: text("reviewed_by").references(() => user.id, {
			onDelete: "set null",
		}),
		reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
		reviewNote: text("review_note"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		index("ai_decision_status_created_idx").on(table.status, table.createdAt),
		index("ai_decision_feature_created_idx").on(table.feature, table.createdAt),
	],
);
