import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "#/platform/db/schema.ts";

export const DB_CONNECTION_TIMEOUT_MS = 5_000;
export const DB_STATEMENT_TIMEOUT_MS = 30_000;

export type TDb = NodePgDatabase<typeof schema>;

export type TDbHandle = {
	readonly db: TDb;
	readonly close: () => Promise<void>;
};

export const dbCreate = (databaseUrl: string): TDbHandle => {
	const pool = new Pool({
		connectionString: databaseUrl,
		connectionTimeoutMillis: DB_CONNECTION_TIMEOUT_MS,
		statement_timeout: DB_STATEMENT_TIMEOUT_MS,
		query_timeout: DB_STATEMENT_TIMEOUT_MS,
	});
	return {
		db: drizzle(pool, { schema }),
		close: (): Promise<void> => pool.end(),
	};
};
