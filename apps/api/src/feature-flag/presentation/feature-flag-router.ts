import { FEATURE_FLAG_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import {
	featureFlagCreateInputSchema,
	featureFlagEvaluationSchema,
	featureFlagIdInputSchema,
	featureFlagListSchema,
	featureFlagSchema,
	featureFlagUpdateWithIdInputSchema,
} from "@app/schemas";
import { Effect } from "effect";
import { z } from "zod";
import { featureFlagCreate } from "#/feature-flag/application/feature-flag-create.ts";
import { featureFlagDelete } from "#/feature-flag/application/feature-flag-delete.ts";
import { featureFlagEvaluate } from "#/feature-flag/application/feature-flag-evaluate.ts";
import { featureFlagList } from "#/feature-flag/application/feature-flag-list.ts";
import { featureFlagUpdate } from "#/feature-flag/application/feature-flag-update.ts";
import { HTTP_METHOD } from "#/platform/http/http-methods.ts";
import {
	permissionRequire,
	protectedProcedure,
} from "#/platform/orpc/middleware.ts";
import { effectRun } from "#/platform/orpc/run-effect.ts";

const featureFlagRouter = {
	list: permissionRequire(PERMISSION.USER_MANAGE)
		.route({ method: HTTP_METHOD.GET, path: "/feature-flags" })
		.output(featureFlagListSchema)
		.handler(({ context }) => effectRun(context.runtime, featureFlagList())),

	evaluate: protectedProcedure
		.route({ method: HTTP_METHOD.GET, path: "/feature-flags/evaluate" })
		.output(featureFlagEvaluationSchema)
		.handler(({ context }) =>
			effectRun(context.runtime, featureFlagEvaluate(context.session!.user.id)),
		),

	create: permissionRequire(PERMISSION.USER_MANAGE)
		.route({ method: HTTP_METHOD.POST, path: "/feature-flags" })
		.input(featureFlagCreateInputSchema)
		.output(featureFlagSchema)
		.handler(({ input, context }) =>
			effectRun(
				context.runtime,
				featureFlagCreate(input, context.session!.user.id),
			),
		),

	update: permissionRequire(PERMISSION.USER_MANAGE)
		.route({ method: HTTP_METHOD.PATCH, path: "/feature-flags/{id}" })
		.input(featureFlagUpdateWithIdInputSchema)
		.output(featureFlagSchema)
		.handler(({ input, context }) => {
			const { id, ...patch } = input;
			return effectRun(
				context.runtime,
				featureFlagUpdate(id, patch, context.session!.user.id),
			);
		}),

	remove: permissionRequire(PERMISSION.USER_MANAGE)
		.route({ method: HTTP_METHOD.DELETE, path: "/feature-flags/{id}" })
		.input(featureFlagIdInputSchema)
		.output(z.object({ message: z.string() }))
		.handler(({ input, context }) =>
			effectRun(
				context.runtime,
				featureFlagDelete(input.id, context.session!.user.id).pipe(
					Effect.map(() => ({ message: FEATURE_FLAG_MESSAGE.DELETED })),
				),
			),
		),
};

export type TFeatureFlagRouter = typeof featureFlagRouter;

export const featureFlagRouterBuild = (): TFeatureFlagRouter =>
	featureFlagRouter;
