import { Effect } from "effect";
import { attendanceLog, AttendanceRepo } from "#/attendance/index.ts";
import { EConflict } from "#/shared/errors.ts";
import { resolveSelfEmployee } from "./resolve-self-employee.ts";

const jakartaDate = (): string =>
	new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Jakarta",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date());

const clock = (userId: string, mode: "in" | "out") =>
	Effect.gen(function* () {
		const employee = yield* resolveSelfEmployee(userId);
		const attendanceRepo = yield* AttendanceRepo;
		const date = jakartaDate();
		const existing = yield* attendanceRepo.findAttendanceLog(employee.id, date);

		if (mode === "in") {
			if (existing?.checkIn) {
				return yield* new EConflict({
					message: "You have already clocked in today.",
				});
			}
			return yield* attendanceLog(
				{
					employeeId: employee.id,
					attendanceDate: date,
					checkIn: new Date().toISOString(),
					status: "present",
				},
				userId,
			);
		}

		if (!existing?.checkIn) {
			return yield* new EConflict({
				message: "Clock in first before clocking out.",
			});
		}
		if (existing.checkOut) {
			return yield* new EConflict({
				message: "You have already clocked out today.",
			});
		}
		return yield* attendanceLog(
			{
				employeeId: employee.id,
				attendanceDate: date,
				checkIn: existing.checkIn.toISOString(),
				checkOut: new Date().toISOString(),
				status: "present",
			},
			userId,
		);
	});

export const selfClockIn = (userId: string) => clock(userId, "in");
export const selfClockOut = (userId: string) => clock(userId, "out");
