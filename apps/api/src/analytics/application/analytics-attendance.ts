import type { TAnalyticsAttendance } from "@app/schemas";
import { Effect } from "effect";
import {
	AnalyticsRepo,
	type TAnalyticsRepoId,
} from "#/analytics/domain/analytics.ts";
import type { EDatabase } from "#/shared/errors.ts";

export const analyticsAttendance = Effect.fn("analyticsAttendance")(function* (
	month: number,
	year: number,
): Effect.fn.Return<TAnalyticsAttendance, EDatabase, TAnalyticsRepoId> {
	const repo = yield* AnalyticsRepo;
	return yield* repo.attendance(month, year);
});
