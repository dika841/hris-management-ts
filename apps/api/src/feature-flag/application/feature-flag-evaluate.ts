import type { TFeatureFlagEvaluation } from "@app/schemas";
import { Effect } from "effect";
import {
	FeatureFlagRepo,
	type TFeatureFlagRepoId,
} from "#/feature-flag/domain/feature-flag.ts";
import { isFlagEnabledFor } from "#/feature-flag/domain/rollout.ts";
import type { EDatabase } from "#/shared/errors.ts";

export const featureFlagEvaluate = Effect.fn("featureFlagEvaluate")(function* (
	userId: string,
): Effect.fn.Return<TFeatureFlagEvaluation, EDatabase, TFeatureFlagRepoId> {
	const repo = yield* FeatureFlagRepo;
	const flags = yield* repo.list();
	return flags.map((flag) => ({
		key: flag.key,
		enabled: isFlagEnabledFor(flag, userId),
	}));
});
