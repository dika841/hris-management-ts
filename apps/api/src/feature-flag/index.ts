export { featureFlagEnabled } from "#/feature-flag/application/feature-flag-enabled.ts";
export type { TFeatureFlagRepoId } from "#/feature-flag/domain/feature-flag.ts";

import { featureFlagRepoLayer } from "#/feature-flag/infrastructure/feature-flag-repository.ts";
import { featureFlagRouterBuild } from "#/feature-flag/presentation/feature-flag-router.ts";

export const featureFlagModule: {
	layer: typeof featureFlagRepoLayer;
	routerBuild: typeof featureFlagRouterBuild;
} = {
	layer: featureFlagRepoLayer,
	routerBuild: featureFlagRouterBuild,
};
