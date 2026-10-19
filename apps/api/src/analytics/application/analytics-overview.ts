import type { TAnalyticsOverview } from "@app/schemas";
import { Effect } from "effect";
import {
	AnalyticsRepo,
	type TAnalyticsRepoId,
} from "#/analytics/domain/analytics.ts";
import type { EDatabase } from "#/shared/errors.ts";

export const analyticsOverview = Effect.fn("analyticsOverview")(function* (
	from: string,
	to: string,
): Effect.fn.Return<TAnalyticsOverview, EDatabase, TAnalyticsRepoId> {
	const repo = yield* AnalyticsRepo;
	return yield* repo.overview(from, to);
});
