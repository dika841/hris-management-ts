import type { TAiDecisionList, TAiDecisionListInput } from "@app/schemas";
import { Effect } from "effect";
import {
	AiDecisionRepo,
	type TAiDecisionRepoId,
} from "#/ai-governance/domain/ai-governance.ts";
import type { EDatabase } from "#/shared/errors.ts";

export const aiDecisionList = Effect.fn("aiDecisionList")(function* (
	input: TAiDecisionListInput,
): Effect.fn.Return<TAiDecisionList, EDatabase, TAiDecisionRepoId> {
	const repo = yield* AiDecisionRepo;
	return yield* repo.list(input);
});
