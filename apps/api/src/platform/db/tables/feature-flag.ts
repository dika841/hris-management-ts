import {
	boolean,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

export const featureFlag = pgTable("feature_flag", {
	id: uuid("id").primaryKey().defaultRandom(),
	key: text("key").notNull().unique(),
	name: text("name").notNull(),
	description: text("description"),
	enabled: boolean("enabled").notNull().default(false),
	rolloutPercentage: integer("rollout_percentage").notNull().default(0),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});
