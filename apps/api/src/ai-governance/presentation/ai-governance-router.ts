import { PERMISSION } from "@app/permissions";
import {
	aiDecisionCreateInputSchema,
	aiDecisionListInputSchema,
	aiDecisionListSchema,
	aiDecisionReviewInputSchema,
	aiDecisionSchema,
} from "@app/schemas";
import { aiDecisionCreate } from "#/ai-governance/application/ai-decision-create.ts";
import { aiDecisionList } from "#/ai-governance/application/ai-decision-list.ts";
import { aiDecisionReview } from "#/ai-governance/application/ai-decision-review.ts";
import { HTTP_METHOD } from "#/platform/http/http-methods.ts";
import { permissionRequire } from "#/platform/orpc/middleware.ts";
import { effectRun } from "#/platform/orpc/run-effect.ts";

const aiGovernanceRouter = {
	list: permissionRequire(PERMISSION.AI_GOVERNANCE_READ)
		.route({ method: HTTP_METHOD.GET, path: "/ai/decisions" })
		.input(aiDecisionListInputSchema)
		.output(aiDecisionListSchema)
		.handler(({ input, context }) =>
			effectRun(context.runtime, aiDecisionList(input)),
		),

	create: permissionRequire(PERMISSION.AI_GOVERNANCE_MANAGE)
		.route({ method: HTTP_METHOD.POST, path: "/ai/decisions" })
		.input(aiDecisionCreateInputSchema)
		.output(aiDecisionSchema)
		.handler(({ input, context }) =>
			effectRun(
				context.runtime,
				aiDecisionCreate(input, context.session!.user.id),
			),
		),

	approve: permissionRequire(PERMISSION.AI_GOVERNANCE_MANAGE)
		.route({ method: HTTP_METHOD.POST, path: "/ai/decisions/{id}/approve" })
		.input(aiDecisionReviewInputSchema)
		.output(aiDecisionSchema)
		.handler(({ input, context }) =>
			effectRun(
				context.runtime,
				aiDecisionReview(
					input.id,
					"approved",
					input.note,
					context.session!.user.id,
				),
			),
		),

	reject: permissionRequire(PERMISSION.AI_GOVERNANCE_MANAGE)
		.route({ method: HTTP_METHOD.POST, path: "/ai/decisions/{id}/reject" })
		.input(aiDecisionReviewInputSchema)
		.output(aiDecisionSchema)
		.handler(({ input, context }) =>
			effectRun(
				context.runtime,
				aiDecisionReview(
					input.id,
					"rejected",
					input.note,
					context.session!.user.id,
				),
			),
		),
};

export type TAiGovernanceRouter = typeof aiGovernanceRouter;

export const aiGovernanceRouterBuild = (): TAiGovernanceRouter =>
	aiGovernanceRouter;
