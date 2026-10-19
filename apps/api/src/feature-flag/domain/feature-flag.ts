import type {
	TFeatureFlag,
	TFeatureFlagCreateInput,
	TFeatureFlagUpdateInput,
} from "@app/schemas";
import { Context, type Effect } from "effect";
import type { EDatabase } from "#/shared/errors.ts";
import { REPO_TAG } from "#/shared/repo-tags.ts";
import type { TServiceId } from "#/shared/service-id.ts";

export type TFeatureFlagRepo = {
	list: () => Effect.Effect<TFeatureFlag[], EDatabase>;
	findByKey: (key: string) => Effect.Effect<TFeatureFlag | null, EDatabase>;
	findById: (id: string) => Effect.Effect<TFeatureFlag | null, EDatabase>;
	create: (
		input: TFeatureFlagCreateInput,
	) => Effect.Effect<TFeatureFlag, EDatabase>;
	update: (
		id: string,
		input: TFeatureFlagUpdateInput,
	) => Effect.Effect<TFeatureFlag, EDatabase>;
	remove: (id: string) => Effect.Effect<void, EDatabase>;
};

export type TFeatureFlagRepoId = TServiceId<typeof REPO_TAG.FEATURE_FLAG>;

export const FeatureFlagRepo = Context.Service<
	TFeatureFlagRepoId,
	TFeatureFlagRepo
>(REPO_TAG.FEATURE_FLAG);
