import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import {
	drizzle as drizzleNeon,
	type NeonDatabase,
} from "drizzle-orm/neon-serverless";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { Pool as NodePool } from "pg";
import * as schema from "#/platform/db/schema.ts";

export const DB_CONNECTION_TIMEOUT_MS = 5_000;
export const DB_STATEMENT_TIMEOUT_MS = 30_000;

const LOCAL_DATABASE_HOSTS = new Set([
	"localhost",
	"127.0.0.1",
	"postgres",
	"host.docker.internal",
]);

const isLocalDatabase = (databaseUrl: string): boolean => {
	try {
		return LOCAL_DATABASE_HOSTS.has(new URL(databaseUrl).hostname);
	} catch {
		return false;
	}
};

export type TDb = NeonDatabase<typeof schema>;

export type TDbHandle = {
	readonly db: TDb;
	readonly close: () => Promise<void>;
};

export const dbCreate = (databaseUrl: string): TDbHandle => {
	if (isLocalDatabase(databaseUrl)) {
		const pool = new NodePool({
			connectionString: databaseUrl,
			connectionTimeoutMillis: DB_CONNECTION_TIMEOUT_MS,
		});
		return {
			// NodePgDatabase and NeonDatabase expose the same drizzle query API.
			db: drizzleNode({ client: pool, schema }) as unknown as TDb,
			close: (): Promise<void> => pool.end(),
		};
	}

	// Execute Neon queries via stateless HTTP fetch in Cloudflare Workers to
	// avoid hanging sockets across isolate suspends.
	neonConfig.poolQueryViaFetch = true;
	const pool = new NeonPool({
		connectionString: databaseUrl,
		connectionTimeoutMillis: DB_CONNECTION_TIMEOUT_MS,
	});
	return {
		db: drizzleNeon({ client: pool, schema }),
		close: (): Promise<void> => pool.end(),
	};
};
