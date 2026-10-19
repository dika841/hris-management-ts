import {
	analyticsAttendanceInputSchema,
	analyticsAttendanceSchema,
	analyticsOverviewInputSchema,
	analyticsOverviewSchema,
	analyticsPayrollTrendInputSchema,
	analyticsPayrollTrendSchema,
} from "@app/schemas";
import { PERMISSION } from "@app/permissions";
import { analyticsAttendance } from "#/analytics/application/analytics-attendance.ts";
import { analyticsOverview } from "#/analytics/application/analytics-overview.ts";
import { analyticsPayrollTrend } from "#/analytics/application/analytics-payroll-trend.ts";
import { HTTP_METHOD } from "#/platform/http/http-methods.ts";
import { permissionRequire } from "#/platform/orpc/middleware.ts";
import { effectRun } from "#/platform/orpc/run-effect.ts";

const analyticsRouter = {
	overview: permissionRequire(PERMISSION.EMPLOYEE_READ)
		.route({ method: HTTP_METHOD.GET, path: "/analytics/overview" })
		.input(analyticsOverviewInputSchema)
		.output(analyticsOverviewSchema)
		.handler(({ input, context }) =>
			effectRun(context.runtime, analyticsOverview(input.from, input.to)),
		),

	payrollTrend: permissionRequire(PERMISSION.PAYROLL_READ)
		.route({ method: HTTP_METHOD.GET, path: "/analytics/payroll-trend" })
		.input(analyticsPayrollTrendInputSchema)
		.output(analyticsPayrollTrendSchema)
		.handler(({ input, context }) =>
			effectRun(context.runtime, analyticsPayrollTrend(input.year)),
		),

	attendance: permissionRequire(PERMISSION.ATTENDANCE_READ)
		.route({ method: HTTP_METHOD.GET, path: "/analytics/attendance" })
		.input(analyticsAttendanceInputSchema)
		.output(analyticsAttendanceSchema)
		.handler(({ input, context }) =>
			effectRun(context.runtime, analyticsAttendance(input.month, input.year)),
		),
};

export type TAnalyticsRouter = typeof analyticsRouter;

export const analyticsRouterBuild = (): TAnalyticsRouter => analyticsRouter;
