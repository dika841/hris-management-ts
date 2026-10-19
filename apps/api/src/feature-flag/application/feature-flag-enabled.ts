import { Effect } from "effect";
import {
	FeatureFlagRepo,
	type TFeatureFlagRepoId,
} from "#/feature-flag/domain/feature-flag.ts";
import { isFlagEnabledFor } from "#/feature-flag/domain/rollout.ts";
import type { EDatabase } from "#/shared/errors.ts";

export const featureFlagEnabled = Effect.fn("featureFlagEnabled")(function* (
	userId: string,
	key: string,
	whenMissing = false,
): Effect.fn.Return<boolean, EDatabase, TFeatureFlagRepoId> {
	const repo = yield* FeatureFlagRepo;
	const flag = yield* repo.findByKey(key);
	return flag === null ? whenMissing : isFlagEnabledFor(flag, userId);
});
