import { and, count, desc, eq, gte, lte, ne, or, type SQL } from "drizzle-orm";
import { Effect, Layer } from "effect";
import {
	attendanceLog,
	leaveBalance,
	leaveRequest,
	leaveType,
	overtimeRequest,
	publicHoliday,
} from "#/platform/db/tables/attendance.ts";
import { DbService, dbServiceLayer } from "#/platform/db/db-service.ts";
import { dbActive } from "#/platform/db/transaction.ts";
import { EDatabase } from "#/shared/errors.ts";

import {
	AttendanceRepo,
	type TAttendanceRepo,
	type TAttendanceLogRow,
	type TLeaveBalanceRow,
	type TLeaveRequestRow,
	type TLeaveTypeRow,
	type TOvertimeRequestRow,
	type TPublicHolidayRow,
} from "#/attendance/domain/attendance.ts";
import type { TAttendanceSummary } from "@app/schemas";

export const attendanceRepoLayer = Layer.effect(
	AttendanceRepo,
	Effect.gen(function* () {
		const { db } = yield* DbService;

		// ---- LEAVE TYPES ----
		const listLeaveTypes: TAttendanceRepo["listLeaveTypes"] = () =>
			Effect.tryPromise({
				try: () =>
					dbActive(db).select().from(leaveType).orderBy(leaveType.name),
				catch: (cause) => new EDatabase({ cause }),
			}) as Effect.Effect<readonly TLeaveTypeRow[], EDatabase>;

		const findLeaveTypeById: TAttendanceRepo["findLeaveTypeById"] = (id) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.select()
						.from(leaveType)
						.where(eq(leaveType.id, id));
					return row ?? null;
				},
				catch: (cause) => new EDatabase({ cause }),
			}) as Effect.Effect<TLeaveTypeRow | null, EDatabase>;

		const findLeaveTypeByCode: TAttendanceRepo["findLeaveTypeByCode"] = (
			code,
		) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.select()
						.from(leaveType)
						.where(eq(leaveType.code, code));
					return row ?? null;
				},
				catch: (cause) => new EDatabase({ cause }),
			}) as Effect.Effect<TLeaveTypeRow | null, EDatabase>;

		const createLeaveType: TAttendanceRepo["createLeaveType"] = (data) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.insert(leaveType)
						.values(data)
						.returning();
					return row!;
				},
				catch: (cause) => new EDatabase({ cause }),
			}) as Effect.Effect<TLeaveTypeRow, EDatabase>;

		const updateLeaveType: TAttendanceRepo["updateLeaveType"] = (id, patch) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.update(leaveType)
						.set({ ...patch, updatedAt: new Date() })
						.where(eq(leaveType.id, id))
						.returning();
					return row ?? null;
				},
				catch: (cause) => new EDatabase({ cause }),
			}) as Effect.Effect<TLeaveTypeRow | null, EDatabase>;

		// ---- LEAVE BALANCES ----
		const listLeaveBalances: TAttendanceRepo["listLeaveBalances"] = (
			employeeId,
			year,
		) =>
			Effect.tryPromise({
				try: () =>
					dbActive(db)
						.select()
						.from(leaveBalance)
						.where(
							and(
								eq(leaveBalance.employeeId, employeeId),
								eq(leaveBalance.year, year),
							),
						),
				catch: (cause) => new EDatabase({ cause }),
			}) as Effect.Effect<readonly TLeaveBalanceRow[], EDatabase>;

		const findLeaveBalance: TAttendanceRepo["findLeaveBalance"] = (
			employeeId,
			leaveTypeId,
			year,
		) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.select()
						.from(leaveBalance)
						.where(
							and(
								eq(leaveBalance.employeeId, employeeId),
								eq(leaveBalance.leaveTypeId, leaveTypeId),
								eq(leaveBalance.year, year),
							),
						);
					return row ?? null;
				},
				catch: (cause) => new EDatabase({ cause }),
			}) as Effect.Effect<TLeaveBalanceRow | null, EDatabase>;

		const upsertLeaveBalance: TAttendanceRepo["upsertLeaveBalance"] = (data) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.insert(leaveBalance)
						.values(data)
						.onConflictDoUpdate({
							target: [
								leaveBalance.employeeId,
								leaveBalance.leaveTypeId,
								leaveBalance.year,
							],
							set: {
								allocatedDays: data.allocatedDays,
								updatedAt: new Date(),
							},
						})
						.returning();
					return row!;
				},
				catch: (cause) => new EDatabase({ cause }),
			}) as Effect.Effect<TLeaveBalanceRow, EDatabase>;

		const updateLeaveBalance: TAttendanceRepo["updateLeaveBalance"] = (
			id,
			patch,
		) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.update(leaveBalance)
						.set({ ...patch, updatedAt: new Date() })
						.where(eq(leaveBalance.id, id))
						.returning();
					return row ?? null;
				},
				catch: (cause) => new EDatabase({ cause }),
			}) as Effect.Effect<TLeaveBalanceRow | null, EDatabase>;

		const forfeitExpiredCarryOver: TAttendanceRepo["forfeitExpiredCarryOver"] =
			(year) =>
				Effect.tryPromise({
					try: async () => {
						const result = await dbActive(db)
							.update(leaveBalance)
							.set({
								forfeitedDays: leaveBalance.carryOverDays,
								carryOverDays: 0,
								updatedAt: new Date(),
							})
							.where(
								and(
									eq(leaveBalance.year, year),
									gte(leaveBalance.carryOverDays, 1),
								),
							);
						return result.rowCount ?? 0;
					},
					catch: (cause) => new EDatabase({ cause }),
				});

		// ---- LEAVE REQUESTS ----
		const listLeaveRequests: TAttendanceRepo["listLeaveRequests"] = ({
			page,
			pageSize,
			employeeId: empId,
			leaveTypeId: ltId,
			status: s,
			year,
		}) => {
			const conditions: (SQL | undefined)[] = [];
			if (empId) conditions.push(eq(leaveRequest.employeeId, empId));
			if (ltId) conditions.push(eq(leaveRequest.leaveTypeId, ltId));
			if (s) conditions.push(eq(leaveRequest.status, s));
			if (year) {
				const startOfYear = `${year}-01-01`;
				const endOfYear = `${year}-12-31`;
				conditions.push(gte(leaveRequest.startDate, startOfYear));
				conditions.push(lte(leaveRequest.endDate, endOfYear));
			}
			const where = conditions.length > 0 ? and(...conditions) : undefined;

			return Effect.tryPromise({
				try: async () => {
					const offset = (page - 1) * pageSize;
					const [items, [{ value: total }]] = await Promise.all([
						dbActive(db)
							.select()
							.from(leaveRequest)
							.where(where)
							.limit(pageSize)
							.offset(offset)
							.orderBy(desc(leaveRequest.createdAt)),
						dbActive(db)
							.select({ value: count() })
							.from(leaveRequest)
							.where(where),
					]);
					return { items: items as TLeaveRequestRow[], total };
				},
				catch: (cause) => new EDatabase({ cause }),
			});
		};

		const findLeaveRequestById: TAttendanceRepo["findLeaveRequestById"] = (
			id,
		) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.select()
						.from(leaveRequest)
						.where(eq(leaveRequest.id, id));
					return (row as TLeaveRequestRow) ?? null;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const createLeaveRequest: TAttendanceRepo["createLeaveRequest"] = (data) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.insert(leaveRequest)
						.values(data)
						.returning();
					return row! as TLeaveRequestRow;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const updateLeaveRequest: TAttendanceRepo["updateLeaveRequest"] = (
			id,
			patch,
		) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.update(leaveRequest)
						.set({ ...patch, updatedAt: new Date() })
						.where(eq(leaveRequest.id, id))
						.returning();
					return (row as TLeaveRequestRow) ?? null;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const countOverlappingLeaveRequests: TAttendanceRepo["countOverlappingLeaveRequests"] =
			(employeeId, startDate, endDate, excludeId) =>
				Effect.tryPromise({
					try: async () => {
						const conditions: SQL[] = [
							eq(leaveRequest.employeeId, employeeId),
							lte(leaveRequest.startDate, endDate),
							gte(leaveRequest.endDate, startDate),
							or(
								eq(leaveRequest.status, "pending"),
								eq(leaveRequest.status, "approved"),
							)!,
						];
						if (excludeId) {
							// workaround for ne import
							conditions.push(eq(leaveRequest.id, excludeId));
						}
						const [{ value: total }] = await dbActive(db)
							.select({ value: count() })
							.from(leaveRequest)
							.where(and(...conditions));
						return total;
					},
					catch: (cause) => new EDatabase({ cause }),
				});

		// ---- ATTENDANCE LOGS ----
		const listAttendanceLogs: TAttendanceRepo["listAttendanceLogs"] = ({
			page,
			pageSize,
			employeeId: empId,
			month,
			year,
			status: s,
		}) => {
			const conditions: (SQL | undefined)[] = [];
			if (empId) conditions.push(eq(attendanceLog.employeeId, empId));
			if (s) conditions.push(eq(attendanceLog.status, s));
			if (year && month) {
				const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
				const endDate = `${year}-${String(month).padStart(2, "0")}-31`;
				conditions.push(gte(attendanceLog.attendanceDate, startDate));
				conditions.push(lte(attendanceLog.attendanceDate, endDate));
			} else if (year) {
				conditions.push(gte(attendanceLog.attendanceDate, `${year}-01-01`));
				conditions.push(lte(attendanceLog.attendanceDate, `${year}-12-31`));
			}
			const where = conditions.length > 0 ? and(...conditions) : undefined;

			return Effect.tryPromise({
				try: async () => {
					const offset = (page - 1) * pageSize;
					const [items, [{ value: total }]] = await Promise.all([
						dbActive(db)
							.select()
							.from(attendanceLog)
							.where(where)
							.limit(pageSize)
							.offset(offset)
							.orderBy(desc(attendanceLog.attendanceDate)),
						dbActive(db)
							.select({ value: count() })
							.from(attendanceLog)
							.where(where),
					]);
					return { items: items as TAttendanceLogRow[], total };
				},
				catch: (cause) => new EDatabase({ cause }),
			});
		};

		const findAttendanceLog: TAttendanceRepo["findAttendanceLog"] = (
			employeeId,
			date,
		) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.select()
						.from(attendanceLog)
						.where(
							and(
								eq(attendanceLog.employeeId, employeeId),
								eq(attendanceLog.attendanceDate, date),
							),
						);
					return (row as TAttendanceLogRow) ?? null;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const upsertAttendanceLog: TAttendanceRepo["upsertAttendanceLog"] = (
			data,
		) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.insert(attendanceLog)
						.values(data)
						.onConflictDoUpdate({
							target: [attendanceLog.employeeId, attendanceLog.attendanceDate],
							set: {
								checkIn: data.checkIn,
								checkOut: data.checkOut,
								status: data.status,
								lateMinutes: data.lateMinutes,
								effectiveWorkMinutes: data.effectiveWorkMinutes,
								notes: data.notes,
								updatedAt: new Date(),
							},
						})
						.returning();
					return row! as TAttendanceLogRow;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const bulkUpsertAttendanceLogs: TAttendanceRepo["bulkUpsertAttendanceLogs"] =
			({ logs }) =>
				Effect.tryPromise({
					try: async () => {
						const rows = await dbActive(db)
							.insert(attendanceLog)
							.values(
								logs.map((l) => ({
									employeeId: l.employeeId,
									attendanceDate: l.attendanceDate,
									checkIn: l.checkIn ? new Date(l.checkIn) : null,
									checkOut: l.checkOut ? new Date(l.checkOut) : null,
									status: l.status ?? "present",
									lateMinutes: 0,
									earlyDepartureMinutes: 0,
									effectiveWorkMinutes: 0,
									leaveRequestId: null,
									notes: l.notes ?? null,
									isHoliday: false,
									holidayName: null,
								})),
							)
							.onConflictDoUpdate({
								target: [
									attendanceLog.employeeId,
									attendanceLog.attendanceDate,
								],
								set: { status: attendanceLog.status, updatedAt: new Date() },
							})
							.returning();
						return rows as TAttendanceLogRow[];
					},
					catch: (cause) => new EDatabase({ cause }),
				});

		const getAttendanceSummary: TAttendanceRepo["getAttendanceSummary"] = (
			employeeId,
			month,
			year,
		) =>
			Effect.tryPromise({
				try: async () => {
					const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
					const endDate = `${year}-${String(month).padStart(2, "0")}-31`;
					const rows = await dbActive(db)
						.select()
						.from(attendanceLog)
						.where(
							and(
								eq(attendanceLog.employeeId, employeeId),
								gte(attendanceLog.attendanceDate, startDate),
								lte(attendanceLog.attendanceDate, endDate),
							),
						);

					const summary: TAttendanceSummary = {
						employeeId,
						month,
						year,
						totalPresent: rows.filter((r) => r.status === "present").length,
						totalSick: rows.filter((r) => r.status === "sick").length,
						totalPermitted: rows.filter((r) => r.status === "permitted").length,
						totalAbsent: rows.filter((r) => r.status === "absent").length,
						totalLeave: rows.filter((r) => r.status === "leave").length,
						totalLateMinutes: rows.reduce((acc, r) => acc + r.lateMinutes, 0),
						totalEffectiveWorkMinutes: rows.reduce(
							(acc, r) => acc + r.effectiveWorkMinutes,
							0,
						),
						totalWorkingDays: rows.filter(
							(r) => !r.isHoliday && r.status !== "off",
						).length,
					};
					return summary;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		// ---- OVERTIME REQUESTS ----
		const listOvertimeRequests: TAttendanceRepo["listOvertimeRequests"] = ({
			page,
			pageSize,
			employeeId: empId,
			status: s,
			month,
			year,
		}) => {
			const conditions: (SQL | undefined)[] = [];
			if (empId) conditions.push(eq(overtimeRequest.employeeId, empId));
			if (s) conditions.push(eq(overtimeRequest.status, s));
			if (year && month) {
				const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
				const endDate = `${year}-${String(month).padStart(2, "0")}-31`;
				conditions.push(gte(overtimeRequest.overtimeDate, startDate));
				conditions.push(lte(overtimeRequest.overtimeDate, endDate));
			}
			const where = conditions.length > 0 ? and(...conditions) : undefined;

			return Effect.tryPromise({
				try: async () => {
					const offset = (page - 1) * pageSize;
					const [items, [{ value: total }]] = await Promise.all([
						dbActive(db)
							.select()
							.from(overtimeRequest)
							.where(where)
							.limit(pageSize)
							.offset(offset)
							.orderBy(desc(overtimeRequest.overtimeDate)),
						dbActive(db)
							.select({ value: count() })
							.from(overtimeRequest)
							.where(where),
					]);
					return { items: items as TOvertimeRequestRow[], total };
				},
				catch: (cause) => new EDatabase({ cause }),
			});
		};

		const findOvertimeById: TAttendanceRepo["findOvertimeById"] = (id) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.select()
						.from(overtimeRequest)
						.where(eq(overtimeRequest.id, id));
					return (row as TOvertimeRequestRow) ?? null;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const createOvertimeRequest: TAttendanceRepo["createOvertimeRequest"] = (
			data,
		) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.insert(overtimeRequest)
						.values(data)
						.returning();
					return row! as TOvertimeRequestRow;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const updateOvertimeRequest: TAttendanceRepo["updateOvertimeRequest"] = (
			id,
			patch,
		) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.update(overtimeRequest)
						.set({ ...patch, updatedAt: new Date() })
						.where(eq(overtimeRequest.id, id))
						.returning();
					return (row as TOvertimeRequestRow) ?? null;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const getWeeklyOvertimeMinutes: TAttendanceRepo["getWeeklyOvertimeMinutes"] =
			(employeeId, weekStart, weekEnd, excludeId) =>
				Effect.tryPromise({
					try: async () => {
						const conditions: SQL[] = [
							eq(overtimeRequest.employeeId, employeeId),
							gte(overtimeRequest.overtimeDate, weekStart),
							lte(overtimeRequest.overtimeDate, weekEnd),
							or(
								eq(overtimeRequest.status, "pending"),
								eq(overtimeRequest.status, "approved"),
							)!,
						];
						if (excludeId) {
							conditions.push(ne(overtimeRequest.id, excludeId));
						}
						const rows = await dbActive(db)
							.select({ duration: overtimeRequest.durationMinutes })
							.from(overtimeRequest)
							.where(and(...conditions));
						const total = rows.reduce((acc, r) => acc + r.duration, 0);
						return total;
					},
					catch: (cause) => new EDatabase({ cause }),
				});

		// ---- PUBLIC HOLIDAYS ----
		const listPublicHolidays: TAttendanceRepo["listPublicHolidays"] = (year) =>
			Effect.tryPromise({
				try: () => {
					const where = year ? eq(publicHoliday.year, year) : undefined;
					return dbActive(db)
						.select()
						.from(publicHoliday)
						.where(where)
						.orderBy(publicHoliday.date);
				},
				catch: (cause) => new EDatabase({ cause }),
			}) as Effect.Effect<readonly TPublicHolidayRow[], EDatabase>;

		const findHolidayByDate: TAttendanceRepo["findHolidayByDate"] = (date) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.select()
						.from(publicHoliday)
						.where(eq(publicHoliday.date, date));
					return (row as TPublicHolidayRow) ?? null;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const createPublicHoliday: TAttendanceRepo["createPublicHoliday"] = (
			data,
		) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.insert(publicHoliday)
						.values(data)
						.returning();
					return row! as TPublicHolidayRow;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const deletePublicHoliday: TAttendanceRepo["deletePublicHoliday"] = (id) =>
			Effect.tryPromise({
				try: async () => {
					const result = await dbActive(db)
						.delete(publicHoliday)
						.where(eq(publicHoliday.id, id));
					return (result.rowCount ?? 0) > 0;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		return AttendanceRepo.of({
			listLeaveTypes,
			findLeaveTypeById,
			findLeaveTypeByCode,
			createLeaveType,
			updateLeaveType,
			listLeaveBalances,
			findLeaveBalance,
			upsertLeaveBalance,
			updateLeaveBalance,
			forfeitExpiredCarryOver,
			listLeaveRequests,
			findLeaveRequestById,
			createLeaveRequest,
			updateLeaveRequest,
			countOverlappingLeaveRequests,
			listAttendanceLogs,
			findAttendanceLog,
			upsertAttendanceLog,
			bulkUpsertAttendanceLogs,
			getAttendanceSummary,
			listOvertimeRequests,
			findOvertimeById,
			createOvertimeRequest,
			updateOvertimeRequest,
			getWeeklyOvertimeMinutes,
			listPublicHolidays,
			findHolidayByDate,
			createPublicHoliday,
			deletePublicHoliday,
		});
	}),
).pipe(Layer.provide(dbServiceLayer));
