import { Effect } from "effect";
import { env } from "#/platform/config/env.ts";
import type { TAiCompletion, TAiMessage } from "#/ai/domain/ai.ts";
import { EBadRequest, EUpstream } from "#/shared/errors.ts";

type TDeepSeekResponse = {
	model?: string;
	choices?: readonly {
		message?: { content?: string };
	}[];
};

const TIMEOUT_MS = 30_000;

export const deepseekComplete = (
	messages: readonly TAiMessage[],
): Effect.Effect<TAiCompletion, EBadRequest | EUpstream> =>
	Effect.gen(function* () {
		const apiKey = env.DEEPSEEK_API_KEY;
		if (apiKey === undefined) {
			return yield* new EBadRequest({
				message: "AI provider is not configured.",
			});
		}

		const response = yield* Effect.tryPromise({
			try: () =>
				fetch(`${env.DEEPSEEK_BASE_URL.replace(/\/$/, "")}/chat/completions`, {
					method: "POST",
					headers: {
						Authorization: `Bearer ${apiKey}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						model: env.DEEPSEEK_MODEL,
						messages,
						temperature: 0.2,
						max_tokens: 900,
						response_format: { type: "json_object" },
					}),
					signal: AbortSignal.timeout(TIMEOUT_MS),
				}),
			catch: () =>
				new EUpstream({
					message: "AI provider is unreachable.",
				}),
		});

		if (!response.ok) {
			return yield* new EUpstream({
				message: `AI provider returned status ${response.status}.`,
			});
		}

		const body = yield* Effect.tryPromise({
			try: () => response.json() as Promise<TDeepSeekResponse>,
			catch: () =>
				new EUpstream({
					message: "AI provider returned an invalid response.",
				}),
		});
		const content = body.choices?.[0]?.message?.content;
		if (content === undefined || content.trim() === "") {
			return yield* new EUpstream({
				message: "AI provider returned an empty response.",
			});
		}
		return {
			content,
			model: body.model ?? env.DEEPSEEK_MODEL,
		};
	});
