import { Pool } from "@neondatabase/serverless";
import { drizzle, type NeonDatabase } from "drizzle-orm/neon-serverless";
import * as schema from "#/platform/db/schema.ts";

export const DB_CONNECTION_TIMEOUT_MS = 5_000;
export const DB_STATEMENT_TIMEOUT_MS = 30_000;

export type TDb = NeonDatabase<typeof schema>;

export type TDbHandle = {
	readonly db: TDb;
	readonly close: () => Promise<void>;
};

export const dbCreate = (databaseUrl: string): TDbHandle => {
	const pool = new Pool({
		connectionString: databaseUrl,
		connectionTimeoutMillis: DB_CONNECTION_TIMEOUT_MS,
	});
	return {
		db: drizzle({ client: pool, schema }),
		close: (): Promise<void> => pool.end(),
	};
};
