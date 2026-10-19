import { analyticsRepoLayer } from "#/analytics/infrastructure/analytics-repository.ts";
import { analyticsRouterBuild } from "#/analytics/presentation/analytics-router.ts";

export const analyticsModule: {
	layer: typeof analyticsRepoLayer;
	routerBuild: typeof analyticsRouterBuild;
} = {
	layer: analyticsRepoLayer,
	routerBuild: analyticsRouterBuild,
};
