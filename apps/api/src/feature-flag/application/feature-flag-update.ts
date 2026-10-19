import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { FEATURE_FLAG_MESSAGE } from "@app/messages";
import type { TFeatureFlag, TFeatureFlagUpdateInput } from "@app/schemas";
import { Effect } from "effect";
import {
	FeatureFlagRepo,
	type TFeatureFlagRepoId,
} from "#/feature-flag/domain/feature-flag.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import { type EDatabase, ENotFound } from "#/shared/errors.ts";

export const featureFlagUpdate = Effect.fn("featureFlagUpdate")(function* (
	id: string,
	input: TFeatureFlagUpdateInput,
	actorId: string,
): Effect.fn.Return<
	TFeatureFlag,
	ENotFound | EDatabase,
	TFeatureFlagRepoId | TActivityRecorderId
> {
	const repo = yield* FeatureFlagRepo;
	const activityRepo = yield* ActivityRecorder;

	const existing = yield* repo.findById(id);
	if (existing === null) {
		return yield* new ENotFound({
			message: FEATURE_FLAG_MESSAGE.NOT_FOUND,
		});
	}

	const flag = yield* repo.update(id, input);
	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.FEATURE_FLAG_UPDATE,
		resourceType: ACTIVITY_RESOURCE_TYPE.FEATURE_FLAG,
		resourceId: flag.id,
		metadata: {
			key: flag.key,
			enabled: flag.enabled,
			rolloutPercentage: flag.rolloutPercentage,
		},
	});
	return flag;
});
