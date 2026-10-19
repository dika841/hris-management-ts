import type {
	TAiDecision,
	TAiDecisionList,
	TAiDecisionListInput,
	TAiDecisionStatus,
	TAiRiskLevel,
} from "@app/schemas";
import { Context, type Effect } from "effect";
import type { EDatabase } from "#/shared/errors.ts";
import { REPO_TAG } from "#/shared/repo-tags.ts";
import type { TServiceId } from "#/shared/service-id.ts";

export type TAiDecisionCreateData = {
	feature: string;
	subjectType: string | null;
	subjectId: string | null;
	promptHash: string;
	model: string;
	decision: unknown;
	confidence: number;
	riskLevel: TAiRiskLevel;
	status: TAiDecisionStatus;
	redactionApplied: boolean;
	reviewedAt?: Date;
	reviewNote?: string;
};

export type TAiDecisionReviewData = {
	status: Exclude<TAiDecisionStatus, "pending_review">;
	reviewedBy: string;
	reviewedAt: Date;
	reviewNote: string | null;
};

export type TAiDecisionRepo = {
	list: (
		input: TAiDecisionListInput,
	) => Effect.Effect<TAiDecisionList, EDatabase>;
	findById: (id: string) => Effect.Effect<TAiDecision | null, EDatabase>;
	create: (
		input: TAiDecisionCreateData,
	) => Effect.Effect<TAiDecision, EDatabase>;
	review: (
		id: string,
		input: TAiDecisionReviewData,
	) => Effect.Effect<TAiDecision, EDatabase>;
};

export type TAiDecisionRepoId = TServiceId<typeof REPO_TAG.AI_DECISION>;

export const AiDecisionRepo = Context.Service<
	TAiDecisionRepoId,
	TAiDecisionRepo
>(REPO_TAG.AI_DECISION);
