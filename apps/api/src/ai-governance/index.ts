import { aiDecisionRepoLayer } from "#/ai-governance/infrastructure/ai-decision-repository.ts";
import { aiGovernanceRouterBuild } from "#/ai-governance/presentation/ai-governance-router.ts";

export { aiDecisionCreate } from "#/ai-governance/application/ai-decision-create.ts";
export { redactPii } from "#/ai-governance/application/redact-pii.ts";
export type { TAiDecisionRepoId } from "#/ai-governance/domain/ai-governance.ts";

export const aiGovernanceModule: {
	layer: typeof aiDecisionRepoLayer;
	routerBuild: typeof aiGovernanceRouterBuild;
} = {
	layer: aiDecisionRepoLayer,
	routerBuild: aiGovernanceRouterBuild,
};
