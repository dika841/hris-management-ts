import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { orpc } from "#/libs/orpc/client.ts";
import type { TClientInputs, TClientOutputs } from "#/libs/orpc/types.ts";

type TAnalyticsIn = TClientInputs["analytics"];
type TAnalyticsOut = TClientOutputs["analytics"];

export const useAnalyticsOverview = (
	input: TAnalyticsIn["overview"],
	enabled: boolean,
): UseQueryResult<TAnalyticsOut["overview"]> =>
	useQuery({
		...orpc.analytics.overview.queryOptions({ input }),
		queryKey: orpc.analytics.overview.key({ input }),
		enabled,
	});

export const useAnalyticsPayrollTrend = (
	input: TAnalyticsIn["payrollTrend"],
	enabled: boolean,
): UseQueryResult<TAnalyticsOut["payrollTrend"]> =>
	useQuery({
		...orpc.analytics.payrollTrend.queryOptions({ input }),
		queryKey: orpc.analytics.payrollTrend.key({ input }),
		enabled,
	});

export const useAnalyticsAttendance = (
	input: TAnalyticsIn["attendance"],
	enabled: boolean,
): UseQueryResult<TAnalyticsOut["attendance"]> =>
	useQuery({
		...orpc.analytics.attendance.queryOptions({ input }),
		queryKey: orpc.analytics.attendance.key({ input }),
		enabled,
	});
