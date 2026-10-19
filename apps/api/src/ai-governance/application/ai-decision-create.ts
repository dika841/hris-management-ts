import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import type { TAiDecision, TAiDecisionCreateInput } from "@app/schemas";
import { Effect } from "effect";
import {
	AiDecisionRepo,
	type TAiDecisionRepoId,
} from "#/ai-governance/domain/ai-governance.ts";
import { redactPii } from "#/ai-governance/application/redact-pii.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import type { EDatabase } from "#/shared/errors.ts";

const AUTO_APPROVE_CONFIDENCE = 90;

export const aiDecisionCreate = Effect.fn("aiDecisionCreate")(function* (
	input: TAiDecisionCreateInput,
	actorId: string,
): Effect.fn.Return<
	TAiDecision,
	EDatabase,
	TAiDecisionRepoId | TActivityRecorderId
> {
	const repo = yield* AiDecisionRepo;
	const activityRepo = yield* ActivityRecorder;
	const redactionApplied = input.redactionApplied ?? true;
	const autoApproved =
		(input.autoApprove ?? false) &&
		input.riskLevel === "low" &&
		input.confidence >= AUTO_APPROVE_CONFIDENCE;

	const decision = yield* repo.create({
		feature: input.feature,
		subjectType: input.subjectType ?? null,
		subjectId: input.subjectId ?? null,
		promptHash: input.promptHash,
		model: input.model,
		decision: redactionApplied ? redactPii(input.decision) : input.decision,
		confidence: input.confidence,
		riskLevel: input.riskLevel,
		status: autoApproved ? "approved" : "pending_review",
		redactionApplied,
		...(autoApproved
			? {
					reviewedAt: new Date(),
					reviewNote: "Auto-approved: low risk with high confidence.",
				}
			: {}),
	});

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.AI_DECISION_CREATE,
		resourceType: ACTIVITY_RESOURCE_TYPE.AI_DECISION,
		resourceId: decision.id,
		metadata: {
			feature: decision.feature,
			riskLevel: decision.riskLevel,
			status: decision.status,
			redactionApplied: decision.redactionApplied,
		},
	});
	return decision;
});
