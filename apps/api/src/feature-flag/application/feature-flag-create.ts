import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { FEATURE_FLAG_MESSAGE } from "@app/messages";
import type { TFeatureFlag, TFeatureFlagCreateInput } from "@app/schemas";
import { Effect } from "effect";
import {
	FeatureFlagRepo,
	type TFeatureFlagRepoId,
} from "#/feature-flag/domain/feature-flag.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import { EConflict, type EDatabase } from "#/shared/errors.ts";

export const featureFlagCreate = Effect.fn("featureFlagCreate")(function* (
	input: TFeatureFlagCreateInput,
	actorId: string,
): Effect.fn.Return<
	TFeatureFlag,
	EConflict | EDatabase,
	TFeatureFlagRepoId | TActivityRecorderId
> {
	const repo = yield* FeatureFlagRepo;
	const activityRepo = yield* ActivityRecorder;

	const existing = yield* repo.findByKey(input.key);
	if (existing !== null) {
		return yield* new EConflict({
			message: FEATURE_FLAG_MESSAGE.KEY_TAKEN,
		});
	}

	const flag = yield* repo.create(input);
	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.FEATURE_FLAG_CREATE,
		resourceType: ACTIVITY_RESOURCE_TYPE.FEATURE_FLAG,
		resourceId: flag.id,
		metadata: { key: flag.key, enabled: flag.enabled },
	});
	return flag;
});
