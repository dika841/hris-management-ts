import { cacheCreate, type TCache, type TCacheClient } from "@app/cache";
import { Context, Effect, Layer } from "effect";
import { Redis } from "ioredis";
import { env } from "#/platform/config/env.ts";
import { closeQuietly } from "#/platform/resource-close.ts";
import type { TServiceId } from "#/shared/service-id.ts";
import { SERVICE_TAG } from "#/platform/service-tags.ts";

const COMMAND_TIMEOUT_MS = 1_000;
const MAX_RETRIES_PER_REQUEST = 1;

const REDIS_TOKEN = {
	EXPIRE_SECONDS: "EX",
	IF_ABSENT: "NX",
	OK: "OK",
} as const;

export const cacheClientCreate = (redisUrl: string): Redis =>
	new Redis(redisUrl, {
		maxRetriesPerRequest: MAX_RETRIES_PER_REQUEST,
		commandTimeout: COMMAND_TIMEOUT_MS,
		enableOfflineQueue: false,
		lazyConnect: false,
	});

export const cacheClientOf = (redis: Redis): TCacheClient => ({
	ping: (): Promise<string> => redis.ping(),
	get: (key: string): Promise<string | null> => redis.get(key),
	setex: (key: string, seconds: number, value: string): Promise<unknown> =>
		redis.setex(key, seconds, value),
	setIfAbsent: async (
		key: string,
		seconds: number,
		value: string,
	): Promise<boolean> =>
		(await redis.set(
			key,
			value,
			REDIS_TOKEN.EXPIRE_SECONDS,
			seconds,
			REDIS_TOKEN.IF_ABSENT,
		)) === REDIS_TOKEN.OK,
	del: (key: string): Promise<number> => redis.del(key),
	incr: (key: string): Promise<number> => redis.incr(key),
	expire: (key: string, seconds: number): Promise<number> =>
		redis.expire(key, seconds),
});

export type TCacheService = {
	readonly client: TCacheClient;
	readonly cache: TCache;
};

export type TCacheServiceId = TServiceId<typeof SERVICE_TAG.CACHE>;

export const CacheService = Context.Service<TCacheServiceId, TCacheService>(
	SERVICE_TAG.CACHE,
);

export const cacheServiceLayer = Layer.effect(
	CacheService,
	Effect.gen(function* () {
		const redis = yield* Effect.acquireRelease(
			Effect.sync((): Redis => {
				const created = cacheClientCreate(env.REDIS_URL);
				created.on("error", (): void => undefined);
				return created;
			}),
			(found): Effect.Effect<void> => closeQuietly(() => found.quit()),
		);

		const client = cacheClientOf(redis);

		return CacheService.of({ client, cache: cacheCreate(client) });
	}),
);
