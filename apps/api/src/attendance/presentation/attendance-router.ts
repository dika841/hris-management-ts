import { PERMISSION } from "@app/permissions";
import {
	attendanceListInputSchema,
	attendanceListSchema,
	attendanceLogInputSchema,
	attendanceLogSchema,
	leaveRequestApproveInputSchema,
	leaveRequestCancelInputSchema,
	leaveRequestCreateInputSchema,
	leaveRequestListInputSchema,
	leaveRequestListSchema,
	leaveRequestRejectInputSchema,
	leaveRequestSchema,
	leaveTypeCreateInputSchema,
	leaveTypeSchema,
	overtimeApproveInputSchema,
	overtimeCalculationSchema,
	overtimeCreateInputSchema,
	overtimeListInputSchema,
	overtimeListSchema,
	overtimeRejectInputSchema,
	overtimeRequestSchema,
	publicHolidayCreateInputSchema,
	publicHolidayListInputSchema,
	publicHolidaySchema,
} from "@app/schemas";
import { z } from "zod";
import { attendanceList } from "#/attendance/application/attendance-list.ts";
import { attendanceLog } from "#/attendance/application/attendance-log.ts";
import { leaveRequestApprove } from "#/attendance/application/leave-request-approve.ts";
import { leaveRequestCancel } from "#/attendance/application/leave-request-cancel.ts";
import { leaveRequestCreate } from "#/attendance/application/leave-request-create.ts";
import { leaveRequestList } from "#/attendance/application/leave-request-list.ts";
import { leaveRequestReject } from "#/attendance/application/leave-request-reject.ts";
import { leaveTypeCreate } from "#/attendance/application/leave-type-create.ts";
import { leaveTypeList } from "#/attendance/application/leave-type-list.ts";
import { overtimeApprove } from "#/attendance/application/overtime-approve.ts";
import { overtimeCalculate } from "#/attendance/application/overtime-calculate.ts";
import { overtimeCreate } from "#/attendance/application/overtime-create.ts";
import { overtimeList } from "#/attendance/application/overtime-list.ts";
import { overtimeReject } from "#/attendance/application/overtime-reject.ts";
import { publicHolidayCreate } from "#/attendance/application/public-holiday-create.ts";
import { publicHolidayList } from "#/attendance/application/public-holiday-list.ts";
import { HTTP_METHOD } from "#/platform/http/http-methods.ts";
import { permissionRequire } from "#/platform/orpc/middleware.ts";
import {
	effectRun,
	effectRunTransactional,
} from "#/platform/orpc/run-effect.ts";

const attendanceRouter = {
	// ---- Leave Types ----
	leaveTypeList: permissionRequire(PERMISSION.LEAVE_READ)
		.route({ method: HTTP_METHOD.GET, path: "/leave/types" })
		.output(z.array(leaveTypeSchema))
		.handler(({ context }) =>
			effectRun(context.runtime, leaveTypeList()).then((r) => [...r]),
		),

	leaveTypeCreate: permissionRequire(PERMISSION.LEAVE_MANAGE)
		.route({ method: HTTP_METHOD.POST, path: "/leave/types" })
		.input(leaveTypeCreateInputSchema)
		.output(leaveTypeSchema)
		.handler(({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				leaveTypeCreate(input, context.session!.user.id),
			),
		),

	// ---- Leave Requests ----
	leaveRequestList: permissionRequire(PERMISSION.LEAVE_READ)
		.route({ method: HTTP_METHOD.GET, path: "/leave/requests" })
		.input(leaveRequestListInputSchema)
		.output(leaveRequestListSchema)
		.handler(({ input, context }) =>
			effectRun(context.runtime, leaveRequestList(input)),
		),

	leaveRequestCreate: permissionRequire(PERMISSION.LEAVE_MANAGE)
		.route({ method: HTTP_METHOD.POST, path: "/leave/requests" })
		.input(leaveRequestCreateInputSchema)
		.output(leaveRequestSchema)
		.handler(({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				leaveRequestCreate(input, context.session!.user.id),
			),
		),

	leaveRequestApprove: permissionRequire(PERMISSION.LEAVE_APPROVE)
		.route({ method: HTTP_METHOD.POST, path: "/leave/requests/{id}/approve" })
		.input(leaveRequestApproveInputSchema)
		.output(leaveRequestSchema)
		.handler(({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				leaveRequestApprove(input, context.session!.user.id),
			),
		),

	leaveRequestReject: permissionRequire(PERMISSION.LEAVE_APPROVE)
		.route({ method: HTTP_METHOD.POST, path: "/leave/requests/{id}/reject" })
		.input(leaveRequestRejectInputSchema)
		.output(leaveRequestSchema)
		.handler(({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				leaveRequestReject(input, context.session!.user.id),
			),
		),

	leaveRequestCancel: permissionRequire(PERMISSION.LEAVE_MANAGE)
		.route({ method: HTTP_METHOD.POST, path: "/leave/requests/{id}/cancel" })
		.input(leaveRequestCancelInputSchema)
		.output(leaveRequestSchema)
		.handler(({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				leaveRequestCancel(input, context.session!.user.id),
			),
		),

	// ---- Attendance ----
	attendanceList: permissionRequire(PERMISSION.ATTENDANCE_READ)
		.route({ method: HTTP_METHOD.GET, path: "/attendance" })
		.input(attendanceListInputSchema)
		.output(attendanceListSchema)
		.handler(({ input, context }) =>
			effectRun(context.runtime, attendanceList(input)),
		),

	attendanceLog: permissionRequire(PERMISSION.ATTENDANCE_MANAGE)
		.route({ method: HTTP_METHOD.POST, path: "/attendance" })
		.input(attendanceLogInputSchema)
		.output(attendanceLogSchema)
		.handler(({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				attendanceLog(input, context.session!.user.id),
			),
		),

	// ---- Overtime ----
	overtimeList: permissionRequire(PERMISSION.OVERTIME_READ)
		.route({ method: HTTP_METHOD.GET, path: "/overtime" })
		.input(overtimeListInputSchema)
		.output(overtimeListSchema)
		.handler(({ input, context }) =>
			effectRun(context.runtime, overtimeList(input)),
		),

	overtimeCreate: permissionRequire(PERMISSION.OVERTIME_MANAGE)
		.route({ method: HTTP_METHOD.POST, path: "/overtime" })
		.input(overtimeCreateInputSchema)
		.output(overtimeRequestSchema)
		.handler(({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				overtimeCreate(input, context.session!.user.id),
			),
		),

	overtimeCalculate: permissionRequire(PERMISSION.OVERTIME_READ)
		.route({ method: HTTP_METHOD.POST, path: "/overtime/calculate" })
		.input(
			overtimeCreateInputSchema.pick({
				employeeId: true,
				overtimeDate: true,
				startTime: true,
				endTime: true,
				dayType: true,
				workScheduleType: true,
			}),
		)
		.output(overtimeCalculationSchema)
		.handler(({ input, context }) =>
			effectRun(context.runtime, overtimeCalculate(input)),
		),

	overtimeApprove: permissionRequire(PERMISSION.OVERTIME_APPROVE)
		.route({ method: HTTP_METHOD.POST, path: "/overtime/{id}/approve" })
		.input(overtimeApproveInputSchema)
		.output(overtimeRequestSchema)
		.handler(({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				overtimeApprove(input, context.session!.user.id),
			),
		),

	overtimeReject: permissionRequire(PERMISSION.OVERTIME_APPROVE)
		.route({ method: HTTP_METHOD.POST, path: "/overtime/{id}/reject" })
		.input(overtimeRejectInputSchema)
		.output(overtimeRequestSchema)
		.handler(({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				overtimeReject(input, context.session!.user.id),
			),
		),

	// ---- Public Holidays ----
	publicHolidayList: permissionRequire(PERMISSION.ATTENDANCE_READ)
		.route({ method: HTTP_METHOD.GET, path: "/holidays" })
		.input(publicHolidayListInputSchema)
		.output(z.array(publicHolidaySchema))
		.handler(({ input, context }) =>
			effectRun(context.runtime, publicHolidayList(input)).then((r) => [...r]),
		),

	publicHolidayCreate: permissionRequire(PERMISSION.ATTENDANCE_MANAGE)
		.route({ method: HTTP_METHOD.POST, path: "/holidays" })
		.input(publicHolidayCreateInputSchema)
		.output(publicHolidaySchema)
		.handler(({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				publicHolidayCreate(input, context.session!.user.id),
			),
		),
};

export type TAttendanceRouter = typeof attendanceRouter;

export const attendanceRouterBuild = (): TAttendanceRouter => attendanceRouter;
