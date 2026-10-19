import type { TFeatureFlag } from "@app/schemas";
import { Effect } from "effect";
import {
	FeatureFlagRepo,
	type TFeatureFlagRepoId,
} from "#/feature-flag/domain/feature-flag.ts";
import type { EDatabase } from "#/shared/errors.ts";

export const featureFlagList = Effect.fn("featureFlagList")(
	function* (): Effect.fn.Return<
		TFeatureFlag[],
		EDatabase,
		TFeatureFlagRepoId
	> {
		const repo = yield* FeatureFlagRepo;
		return yield* repo.list();
	},
);
