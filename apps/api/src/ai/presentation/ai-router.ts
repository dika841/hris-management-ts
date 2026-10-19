import { PERMISSION } from "@app/permissions";
import { aiAssistInputSchema, aiAssistOutputSchema } from "@app/schemas";
import { aiAssist } from "#/ai/application/ai-assist.ts";
import { HTTP_METHOD } from "#/platform/http/http-methods.ts";
import { permissionRequire } from "#/platform/orpc/middleware.ts";
import { effectRun } from "#/platform/orpc/run-effect.ts";

const aiRouter = {
	assist: permissionRequire(PERMISSION.AI_GOVERNANCE_MANAGE)
		.route({ method: HTTP_METHOD.POST, path: "/ai/assist" })
		.input(aiAssistInputSchema)
		.output(aiAssistOutputSchema)
		.handler(({ input, context }) =>
			effectRun(context.runtime, aiAssist(input, context.session!.user.id)),
		),
};

export type TAiRouter = typeof aiRouter;

export const aiRouterBuild = (): TAiRouter => aiRouter;
