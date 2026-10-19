import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { AI_GOVERNANCE_MESSAGE } from "@app/messages";
import type { TAiDecision } from "@app/schemas";
import { Effect } from "effect";
import {
	AiDecisionRepo,
	type TAiDecisionRepoId,
} from "#/ai-governance/domain/ai-governance.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import {
	EBadRequest,
	EConflict,
	type EDatabase,
	ENotFound,
} from "#/shared/errors.ts";

export const aiDecisionReview = Effect.fn("aiDecisionReview")(function* (
	id: string,
	status: "approved" | "rejected",
	note: string | undefined,
	actorId: string,
): Effect.fn.Return<
	TAiDecision,
	ENotFound | EConflict | EBadRequest | EDatabase,
	TAiDecisionRepoId | TActivityRecorderId
> {
	const repo = yield* AiDecisionRepo;
	const activityRepo = yield* ActivityRecorder;
	const existing = yield* repo.findById(id);
	if (existing === null) {
		return yield* new ENotFound({
			message: AI_GOVERNANCE_MESSAGE.NOT_FOUND,
		});
	}
	if (existing.status !== "pending_review") {
		return yield* new EConflict({
			message: AI_GOVERNANCE_MESSAGE.ALREADY_REVIEWED,
		});
	}
	if (status === "rejected" && (note === undefined || note.trim() === "")) {
		return yield* new EBadRequest({
			message: AI_GOVERNANCE_MESSAGE.REJECT_NOTE_REQUIRED,
		});
	}

	const reviewed = yield* repo.review(id, {
		status,
		reviewedBy: actorId,
		reviewedAt: new Date(),
		reviewNote: note?.trim() || null,
	});

	yield* activityRepo.insert({
		actorId,
		action:
			status === "approved"
				? ACTIVITY_ACTION.AI_DECISION_APPROVE
				: ACTIVITY_ACTION.AI_DECISION_REJECT,
		resourceType: ACTIVITY_RESOURCE_TYPE.AI_DECISION,
		resourceId: reviewed.id,
		metadata: { feature: reviewed.feature, status },
	});
	return reviewed;
});
