import type { TAnalyticsPayrollTrend } from "@app/schemas";
import { Effect } from "effect";
import {
	AnalyticsRepo,
	type TAnalyticsRepoId,
} from "#/analytics/domain/analytics.ts";
import type { EDatabase } from "#/shared/errors.ts";

export const analyticsPayrollTrend = Effect.fn("analyticsPayrollTrend")(
	function* (
		year: number,
	): Effect.fn.Return<TAnalyticsPayrollTrend, EDatabase, TAnalyticsRepoId> {
		const repo = yield* AnalyticsRepo;
		return yield* repo.payrollTrend(year);
	},
);
