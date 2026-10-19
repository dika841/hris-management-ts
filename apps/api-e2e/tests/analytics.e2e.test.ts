import type {
	TAnalyticsAttendance,
	TAnalyticsOverview,
	TAnalyticsPayrollTrend,
} from "@app/schemas";
import { beforeAll, describe, expect, it } from "vitest";
import { apiFetch, apiJson } from "../support/api-fetch.ts";
import { SEED_CREDENTIALS, signIn } from "../support/sign-in.ts";

let adminCookie = "";

beforeAll(async (): Promise<void> => {
	adminCookie = await signIn(SEED_CREDENTIALS.admin);
});

describe("analytics endpoints", () => {
	it("returns headcount and movement for the selected period", async (): Promise<void> => {
		const overview = await apiJson<TAnalyticsOverview>({
			path: "/analytics/overview?from=2000-01-01&to=2100-12-31",
			cookie: adminCookie,
		});

		expect(overview.headcount.total).toBeGreaterThan(0);
		expect(overview.headcount.permanent).toBeGreaterThan(0);
		expect(overview.byDepartment.length).toBeGreaterThan(0);
		expect(overview.movement.turnoverRate).toBeGreaterThanOrEqual(0);
	});

	it("returns payroll trend and attendance summary", async (): Promise<void> => {
		const trend = await apiJson<TAnalyticsPayrollTrend>({
			path: "/analytics/payroll-trend?year=2026",
			cookie: adminCookie,
		});
		expect(Array.isArray(trend)).toBe(true);

		const attendance = await apiJson<TAnalyticsAttendance>({
			path: "/analytics/attendance?month=10&year=2026",
			cookie: adminCookie,
		});
		expect(attendance.totalLogs).toBeGreaterThanOrEqual(0);
		expect(Array.isArray(attendance.byStatus)).toBe(true);
	});

	it("rejects anonymous analytics access", async (): Promise<void> => {
		const response = await apiFetch({
			path: "/analytics/overview?from=2026-01-01&to=2026-12-31",
		});
		expect(response.status).toBe(401);
	});
});
