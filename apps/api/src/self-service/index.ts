import { selfRouterBuild } from "#/self-service/presentation/self-router.ts";

export const selfServiceModule: {
	routerBuild: typeof selfRouterBuild;
} = {
	routerBuild: selfRouterBuild,
};
