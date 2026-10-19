import type { TFeatureFlagEvaluation } from "@app/schemas";
import { Effect } from "effect";
import {
	FeatureFlagRepo,
	type TFeatureFlagRepoId,
} from "#/feature-flag/domain/feature-flag.ts";
import type { EDatabase } from "#/shared/errors.ts";

const bucket = (userId: string, key: string): number => {
	let hash = 2166136261;
	const input = `${userId}:${key}`;
	for (let index = 0; index < input.length; index += 1) {
		hash ^= input.charCodeAt(index);
		hash = Math.imul(hash, 16777619);
	}
	return Math.abs(hash) % 100;
};

export const featureFlagEvaluate = Effect.fn("featureFlagEvaluate")(function* (
	userId: string,
): Effect.fn.Return<TFeatureFlagEvaluation, EDatabase, TFeatureFlagRepoId> {
	const repo = yield* FeatureFlagRepo;
	const flags = yield* repo.list();
	return flags.map((flag) => ({
		key: flag.key,
		enabled: flag.enabled && bucket(userId, flag.key) < flag.rolloutPercentage,
	}));
});
