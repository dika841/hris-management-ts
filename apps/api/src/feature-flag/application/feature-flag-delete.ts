import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { FEATURE_FLAG_MESSAGE } from "@app/messages";
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

export const featureFlagDelete = Effect.fn("featureFlagDelete")(function* (
	id: string,
	actorId: string,
): Effect.fn.Return<
	void,
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

	yield* repo.remove(id);
	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.FEATURE_FLAG_DELETE,
		resourceType: ACTIVITY_RESOURCE_TYPE.FEATURE_FLAG,
		resourceId: id,
		metadata: { key: existing.key },
	});
});
