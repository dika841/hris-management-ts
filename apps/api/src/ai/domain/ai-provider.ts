import { Context, type Effect } from "effect";
import type { TAiCompletion, TAiMessage } from "#/ai/domain/ai.ts";
import type { EBadRequest, EUpstream } from "#/shared/errors.ts";
import { REPO_TAG } from "#/shared/repo-tags.ts";
import type { TServiceId } from "#/shared/service-id.ts";

export type TAiProvider = {
	complete: (
		messages: readonly TAiMessage[],
	) => Effect.Effect<TAiCompletion, EBadRequest | EUpstream>;
};

export type TAiProviderId = TServiceId<typeof REPO_TAG.AI_PROVIDER>;

export const AiProvider = Context.Service<TAiProviderId, TAiProvider>(
	REPO_TAG.AI_PROVIDER,
);
