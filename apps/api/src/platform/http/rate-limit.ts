import {
	rateLimitCheck,
	type TCacheClient,
	type TRateLimitResult,
} from "@app/cache";
import { ERROR_MESSAGE } from "@app/messages";
import type { Context, Next } from "hono";
import { match } from "ts-pattern";
import { HTTP_STATUS } from "#/platform/http/http-status.ts";
import { rateLimitIdentifierOf } from "#/platform/http/rate-limit-identifier.ts";
import type { TRateLimitScope } from "#/platform/http/rate-limit-scopes.ts";
import { logger } from "#/platform/observability/logger.ts";

export type TRateLimitOptions = {
	client: TCacheClient;
	scope: TRateLimitScope;
	windowSeconds: number;
	max: number;
	trustedProxyIps: readonly string[];
};

export const rateLimit =
	(options: TRateLimitOptions) =>
	async (context: Context, next: Next): Promise<Response | undefined> => {
		const result = await rateLimitCheck(options.client, {
			identifier: rateLimitIdentifierOf(context, options.trustedProxyIps),
			scope: options.scope,
			windowSeconds: options.windowSeconds,
			max: options.max,
		}).catch(
			(err: unknown): TRateLimitResult => {
				logger.warn({ err }, "rate-limit check failed, failing open");
				return {
					allowed: true,
					count: 0,
					remaining: options.max,
				};
			},
		);

		return match(result.allowed)
			.with(
				false,
				(): Response =>
					context.json(
						{ message: ERROR_MESSAGE.TOO_MANY_REQUESTS },
						HTTP_STATUS.TOO_MANY_REQUESTS,
					),
			)
			.otherwise(async (): Promise<undefined> => {
				await next();
				return undefined;
			});
	};
