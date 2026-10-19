import type {
	TAnalyticsAttendance,
	TAnalyticsOverview,
	TAnalyticsPayrollTrend,
} from "@app/schemas";
import { Context, type Effect } from "effect";
import type { EDatabase } from "#/shared/errors.ts";
import { REPO_TAG } from "#/shared/repo-tags.ts";
import type { TServiceId } from "#/shared/service-id.ts";

export type TAnalyticsRepo = {
	overview: (
		from: string,
		to: string,
	) => Effect.Effect<TAnalyticsOverview, EDatabase>;
	payrollTrend: (
		year: number,
	) => Effect.Effect<TAnalyticsPayrollTrend, EDatabase>;
	attendance: (
		month: number,
		year: number,
	) => Effect.Effect<TAnalyticsAttendance, EDatabase>;
};

export type TAnalyticsRepoId = TServiceId<typeof REPO_TAG.ANALYTICS>;

export const AnalyticsRepo = Context.Service<TAnalyticsRepoId, TAnalyticsRepo>(
	REPO_TAG.ANALYTICS,
);
