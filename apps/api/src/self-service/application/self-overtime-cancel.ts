import { ATTENDANCE_MESSAGE } from "@app/messages";
import { Effect } from "effect";
import { AttendanceRepo, overtimeCancel } from "#/attendance/index.ts";
import { ENotFound } from "#/shared/errors.ts";
import { resolveSelfEmployee } from "./resolve-self-employee.ts";

export const selfOvertimeCancel = (userId: string, id: string) =>
	Effect.gen(function* () {
		const employee = yield* resolveSelfEmployee(userId);
		const attendanceRepo = yield* AttendanceRepo;
		const request = yield* attendanceRepo.findOvertimeById(id);
		if (request === null || request.employeeId !== employee.id) {
			return yield* new ENotFound({
				message: ATTENDANCE_MESSAGE.OVERTIME_NOT_FOUND,
			});
		}
		return yield* overtimeCancel({ id }, userId);
	});
