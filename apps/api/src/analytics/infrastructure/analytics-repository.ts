import { and, eq, gte, lte } from "drizzle-orm";
import { Effect, Layer } from "effect";
import { DbService, dbServiceLayer } from "#/platform/db/db-service.ts";
import { attendanceLog } from "#/platform/db/tables/attendance.ts";
import { employee } from "#/platform/db/tables/employee.ts";
import { payrollPeriod } from "#/platform/db/tables/payroll.ts";
import { dbActive } from "#/platform/db/transaction.ts";
import { EDatabase } from "#/shared/errors.ts";
import {
	AnalyticsRepo,
	type TAnalyticsRepo,
} from "#/analytics/domain/analytics.ts";
import type {
	TAnalyticsAttendance,
	TAnalyticsOverview,
	TAnalyticsPayrollTrend,
} from "@app/schemas";

export const analyticsRepoLayer = Layer.effect(
	AnalyticsRepo,
	Effect.gen(function* () {
		const { db } = yield* DbService;

		const overview: TAnalyticsRepo["overview"] = (from, to) =>
			Effect.tryPromise({
				try: async () => {
					const rows = await dbActive(db).select().from(employee);
					const today = new Date().toISOString().slice(0, 10);
					const active = rows.filter(
						(row) => row.endDate === null || row.endDate >= today,
					);
					const newHires = rows.filter(
						(row) => row.joinDate >= from && row.joinDate <= to,
					).length;
					const exits = rows.filter(
						(row) =>
							row.endDate !== null && row.endDate >= from && row.endDate <= to,
					).length;
					const byDepartment = new Map<string, number>();
					const byStatus = new Map<string, number>();
					for (const row of active) {
						byDepartment.set(
							row.department,
							(byDepartment.get(row.department) ?? 0) + 1,
						);
						byStatus.set(
							row.employmentStatus,
							(byStatus.get(row.employmentStatus) ?? 0) + 1,
						);
					}

					const result: TAnalyticsOverview = {
						headcount: {
							total: active.length,
							permanent: byStatus.get("permanent") ?? 0,
							contract: byStatus.get("contract") ?? 0,
							probation: byStatus.get("probation") ?? 0,
							intern: byStatus.get("intern") ?? 0,
						},
						movement: {
							newHires,
							exits,
							turnoverRate:
								Math.round((exits / Math.max(active.length, 1)) * 1000) / 10,
						},
						byDepartment: [...byDepartment.entries()]
							.map(([department, count]) => ({ department, count }))
							.sort((a, b) => b.count - a.count),
						byStatus: [...byStatus.entries()].map(([status, count]) => ({
							status:
								status as TAnalyticsOverview["byStatus"][number]["status"],
							count,
						})),
					};
					return result;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const payrollTrend: TAnalyticsRepo["payrollTrend"] = (year) =>
			Effect.tryPromise({
				try: async () => {
					const rows = await dbActive(db)
						.select()
						.from(payrollPeriod)
						.where(eq(payrollPeriod.year, year))
						.orderBy(payrollPeriod.month);
					return rows as TAnalyticsPayrollTrend;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const attendance: TAnalyticsRepo["attendance"] = (month, year) =>
			Effect.tryPromise({
				try: async () => {
					const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
					const endDate = `${year}-${String(month).padStart(2, "0")}-31`;
					const rows = await dbActive(db)
						.select()
						.from(attendanceLog)
						.where(
							and(
								gte(attendanceLog.attendanceDate, startDate),
								lte(attendanceLog.attendanceDate, endDate),
							),
						);
					const byStatus = new Map<string, number>();
					for (const row of rows) {
						byStatus.set(row.status, (byStatus.get(row.status) ?? 0) + 1);
					}
					const result: TAnalyticsAttendance = {
						totalLogs: rows.length,
						byStatus: [...byStatus.entries()].map(([status, count]) => ({
							status:
								status as TAnalyticsAttendance["byStatus"][number]["status"],
							count,
						})),
						totalLateMinutes: rows.reduce(
							(total, row) => total + row.lateMinutes,
							0,
						),
						totalEffectiveWorkMinutes: rows.reduce(
							(total, row) => total + row.effectiveWorkMinutes,
							0,
						),
					};
					return result;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		return AnalyticsRepo.of({ overview, payrollTrend, attendance });
	}),
).pipe(Layer.provide(dbServiceLayer));
