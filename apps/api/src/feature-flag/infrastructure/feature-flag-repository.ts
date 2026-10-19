import { eq } from "drizzle-orm";
import { Effect, Layer } from "effect";
import { DbService, dbServiceLayer } from "#/platform/db/db-service.ts";
import { featureFlag } from "#/platform/db/tables/feature-flag.ts";
import { dbActive } from "#/platform/db/transaction.ts";
import {
	FeatureFlagRepo,
	type TFeatureFlagRepo,
} from "#/feature-flag/domain/feature-flag.ts";
import type { TFeatureFlag } from "@app/schemas";
import { EDatabase } from "#/shared/errors.ts";

const toDto = (row: typeof featureFlag.$inferSelect): TFeatureFlag => ({
	id: row.id,
	key: row.key,
	name: row.name,
	description: row.description,
	enabled: row.enabled,
	rolloutPercentage: row.rolloutPercentage,
	createdAt: row.createdAt.toISOString(),
	updatedAt: row.updatedAt.toISOString(),
});

export const featureFlagRepoLayer = Layer.effect(
	FeatureFlagRepo,
	Effect.gen(function* () {
		const { db } = yield* DbService;

		const list: TFeatureFlagRepo["list"] = () =>
			Effect.tryPromise({
				try: async () => {
					const rows = await dbActive(db).select().from(featureFlag);
					return rows.map(toDto);
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const findByKey: TFeatureFlagRepo["findByKey"] = (key) =>
			Effect.tryPromise({
				try: async () => {
					const rows = await dbActive(db)
						.select()
						.from(featureFlag)
						.where(eq(featureFlag.key, key))
						.limit(1);
					return rows[0] === undefined ? null : toDto(rows[0]);
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const findById: TFeatureFlagRepo["findById"] = (id) =>
			Effect.tryPromise({
				try: async () => {
					const rows = await dbActive(db)
						.select()
						.from(featureFlag)
						.where(eq(featureFlag.id, id))
						.limit(1);
					return rows[0] === undefined ? null : toDto(rows[0]);
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const create: TFeatureFlagRepo["create"] = (input) =>
			Effect.tryPromise({
				try: async () => {
					const rows = await dbActive(db)
						.insert(featureFlag)
						.values({
							key: input.key,
							name: input.name,
							description: input.description ?? null,
							enabled: input.enabled ?? false,
							rolloutPercentage: input.rolloutPercentage ?? 0,
						})
						.returning();
					return toDto(rows[0]!);
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const update: TFeatureFlagRepo["update"] = (id, input) =>
			Effect.tryPromise({
				try: async () => {
					const rows = await dbActive(db)
						.update(featureFlag)
						.set({ ...input, updatedAt: new Date() })
						.where(eq(featureFlag.id, id))
						.returning();
					return toDto(rows[0]!);
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const remove: TFeatureFlagRepo["remove"] = (id) =>
			Effect.tryPromise({
				try: async () => {
					await dbActive(db).delete(featureFlag).where(eq(featureFlag.id, id));
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		return FeatureFlagRepo.of({
			list,
			findByKey,
			findById,
			create,
			update,
			remove,
		});
	}),
).pipe(Layer.provide(dbServiceLayer));
