import { aiProviderLayer } from "#/ai/infrastructure/deepseek-provider.ts";
import { aiRouterBuild } from "#/ai/presentation/ai-router.ts";

export const aiModule: {
	layer: typeof aiProviderLayer;
	routerBuild: typeof aiRouterBuild;
} = {
	layer: aiProviderLayer,
	routerBuild: aiRouterBuild,
};
