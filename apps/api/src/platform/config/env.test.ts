import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

const resetEnv = (): void => {
	for (const key of Object.keys(process.env)) {
		delete process.env[key];
	}
	Object.assign(process.env, ORIGINAL_ENV);
	vi.resetModules();
};

const envSet = (values: Record<string, string | undefined>): void => {
	for (const [key, value] of Object.entries(values)) {
		if (value === undefined) {
			delete process.env[key];
		} else {
			process.env[key] = value;
		}
	}
};

afterEach(resetEnv);

describe("env", () => {
	it("fails outside test when REDIS_URL is missing", async () => {
		envSet({
			NODE_ENV: "production",
			BETTER_AUTH_URL: "https://api.standard.test",
			WEB_ORIGIN: "https://standard.test",
			BETTER_AUTH_SECRET: "a-32-character-production-secret!",
			DATABASE_URL: "postgres://app:app@localhost:5432/app",
			METRICS_ENABLED: "false",
			REDIS_URL: undefined,
		});

		let thrown: unknown;
		try {
			const module = await import("#/platform/config/env.ts");
			void module.env.REDIS_URL;
		} catch (cause) {
			thrown = cause;
		}

		expect(thrown).toBeInstanceOf(Error);
	});

	it("uses local fallbacks for the test runner", async () => {
		envSet({
			NODE_ENV: "test",
			BETTER_AUTH_URL: "https://api.standard.test",
			REDIS_URL: undefined,
			DATABASE_URL: undefined,
		});

		const module = await import("#/platform/config/env.ts");
		expect(module.env.REDIS_URL).toBe("redis://localhost:6379");
	});

	it("keeps an explicit REDIS_URL", async () => {
		envSet({
			NODE_ENV: "production",
			BETTER_AUTH_URL: "https://api.standard.test",
			WEB_ORIGIN: "https://standard.test",
			BETTER_AUTH_SECRET: "a-32-character-production-secret!",
			DATABASE_URL: "postgres://app:app@localhost:5432/app",
			METRICS_ENABLED: "false",
			REDIS_URL: "rediss://default:secret@example.upstash.io:6379",
		});

		const module = await import("#/platform/config/env.ts");
		expect(module.env.REDIS_URL).toBe(
			"rediss://default:secret@example.upstash.io:6379",
		);
	});
});
