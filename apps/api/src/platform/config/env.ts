import { envSchema, type TEnv } from "#/platform/config/env-schema.ts";

export type { TEnv } from "#/platform/config/env-schema.ts";

let parsed: TEnv | null = null;

const FALLBACK_ENV: Record<string, string> = {
	DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/hris",
	REDIS_URL: "redis://localhost:6379",
	BETTER_AUTH_SECRET: "placeholder-secret-at-least-32-chars-long!!",
	METRICS_TOKEN: "placeholder-metrics-token-32-chars-long!",
};

const envRead = (): TEnv => {
	if (parsed) return parsed;

	const attempt = envSchema.safeParse(process.env);
	if (attempt.success) {
		parsed = attempt.data;
		return parsed;
	}

	const merged = { ...FALLBACK_ENV, ...process.env };
	const fallbackAttempt = envSchema.safeParse(merged);
	if (fallbackAttempt.success) {
		return fallbackAttempt.data;
	}

	throw attempt.error;
};

export const env: TEnv = new Proxy({} as TEnv, {
	get: (_target, key: string): unknown => envRead()[key as keyof TEnv],
});
