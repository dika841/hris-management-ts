import {
	attendanceListSchema,
	attendanceLogSchema,
	attendanceSummarySchema,
	leaveBalanceSchema,
	leaveRequestListInputSchema,
	leaveRequestListSchema,
	leaveRequestSchema,
	leaveTypeSchema,
	overtimeListInputSchema,
	overtimeListSchema,
	overtimeRequestSchema,
	payrollItemSchema,
	payrollPayslipSchema,
	selfAttendanceListInputSchema,
	selfAttendanceSummaryInputSchema,
	selfLeaveCreateInputSchema,
	selfOvertimeCreateInputSchema,
	selfProfileSchema,
} from "@app/schemas";
import { z } from "zod";
import { HTTP_METHOD } from "#/platform/http/http-methods.ts";
import { protectedProcedure } from "#/platform/orpc/middleware.ts";
import {
	effectRun,
	effectRunTransactional,
} from "#/platform/orpc/run-effect.ts";
import { selfAttendanceList } from "#/self-service/application/self-attendance-list.ts";
import { selfAttendanceSummary } from "#/self-service/application/self-attendance-summary.ts";
import {
	selfClockIn,
	selfClockOut,
} from "#/self-service/application/self-attendance-clock.ts";
import { selfLeaveCancel } from "#/self-service/application/self-leave-cancel.ts";
import { selfLeaveCreate } from "#/self-service/application/self-leave-create.ts";
import { selfLeaveBalances } from "#/self-service/application/self-leave-balances.ts";
import { selfLeaveList } from "#/self-service/application/self-leave-list.ts";
import { selfLeaveTypes } from "#/self-service/application/self-leave-types.ts";
import { selfOvertimeCancel } from "#/self-service/application/self-overtime-cancel.ts";
import { selfOvertimeCreate } from "#/self-service/application/self-overtime-create.ts";
import { selfOvertimeList } from "#/self-service/application/self-overtime-list.ts";
import { selfPayslipGet } from "#/self-service/application/self-payslip-get.ts";
import { selfPayslipList } from "#/self-service/application/self-payslip-list.ts";
import { selfProfileGet } from "#/self-service/application/self-profile-get.ts";

const selfRouter = {
	profile: protectedProcedure
		.route({ method: HTTP_METHOD.GET, path: "/self/profile" })
		.output(selfProfileSchema)
		.handler(({ context }) =>
			effectRun(context.runtime, selfProfileGet(context.session!.user.id)),
		),

	attendanceList: protectedProcedure
		.route({ method: HTTP_METHOD.GET, path: "/self/attendance" })
		.input(selfAttendanceListInputSchema)
		.output(attendanceListSchema)
		.handler(({ input, context }) =>
			effectRun(
				context.runtime,
				selfAttendanceList(context.session!.user.id, input),
			),
		),

	attendanceSummary: protectedProcedure
		.route({ method: HTTP_METHOD.GET, path: "/self/attendance/summary" })
		.input(selfAttendanceSummaryInputSchema)
		.output(attendanceSummarySchema)
		.handler(({ input, context }) =>
			effectRun(
				context.runtime,
				selfAttendanceSummary(context.session!.user.id, input),
			),
		),

	clockIn: protectedProcedure
		.route({ method: HTTP_METHOD.POST, path: "/self/attendance/clock-in" })
		.output(attendanceLogSchema)
		.handler(({ context }) =>
			effectRun(context.runtime, selfClockIn(context.session!.user.id)),
		),

	clockOut: protectedProcedure
		.route({ method: HTTP_METHOD.POST, path: "/self/attendance/clock-out" })
		.output(attendanceLogSchema)
		.handler(({ context }) =>
			effectRun(context.runtime, selfClockOut(context.session!.user.id)),
		),

	leaveTypes: protectedProcedure
		.route({ method: HTTP_METHOD.GET, path: "/self/leave/types" })
		.output(z.array(leaveTypeSchema))
		.handler(({ context }) =>
			effectRun(context.runtime, selfLeaveTypes(context.session!.user.id)),
		),

	leaveBalances: protectedProcedure
		.route({ method: HTTP_METHOD.GET, path: "/self/leave/balances" })
		.input(z.object({ year: z.number().int() }))
		.output(z.array(leaveBalanceSchema))
		.handler(({ input, context }) =>
			effectRun(
				context.runtime,
				selfLeaveBalances(context.session!.user.id, input.year),
			),
		),

	leaveList: protectedProcedure
		.route({ method: HTTP_METHOD.GET, path: "/self/leave" })
		.input(leaveRequestListInputSchema.omit({ employeeId: true }))
		.output(leaveRequestListSchema)
		.handler(({ input, context }) =>
			effectRun(
				context.runtime,
				selfLeaveList(context.session!.user.id, input),
			),
		),

	leaveCreate: protectedProcedure
		.route({ method: HTTP_METHOD.POST, path: "/self/leave" })
		.input(selfLeaveCreateInputSchema)
		.output(leaveRequestSchema)
		.handler(({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				selfLeaveCreate(context.session!.user.id, input),
			),
		),

	leaveCancel: protectedProcedure
		.route({ method: HTTP_METHOD.POST, path: "/self/leave/{id}/cancel" })
		.input(z.object({ id: z.string().min(1) }))
		.output(leaveRequestSchema)
		.handler(({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				selfLeaveCancel(context.session!.user.id, input.id),
			),
		),

	overtimeList: protectedProcedure
		.route({ method: HTTP_METHOD.GET, path: "/self/overtime" })
		.input(overtimeListInputSchema.omit({ employeeId: true }))
		.output(overtimeListSchema)
		.handler(({ input, context }) =>
			effectRun(
				context.runtime,
				selfOvertimeList(context.session!.user.id, input),
			),
		),

	overtimeCreate: protectedProcedure
		.route({ method: HTTP_METHOD.POST, path: "/self/overtime" })
		.input(selfOvertimeCreateInputSchema)
		.output(overtimeRequestSchema)
		.handler(({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				selfOvertimeCreate(context.session!.user.id, input),
			),
		),

	overtimeCancel: protectedProcedure
		.route({ method: HTTP_METHOD.POST, path: "/self/overtime/{id}/cancel" })
		.input(z.object({ id: z.string().min(1) }))
		.output(overtimeRequestSchema)
		.handler(({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				selfOvertimeCancel(context.session!.user.id, input.id),
			),
		),

	payslipList: protectedProcedure
		.route({ method: HTTP_METHOD.GET, path: "/self/payslips" })
		.output(z.array(payrollItemSchema))
		.handler(({ context }) =>
			effectRun(context.runtime, selfPayslipList(context.session!.user.id)),
		),

	payslipGet: protectedProcedure
		.route({ method: HTTP_METHOD.GET, path: "/self/payslips/{id}" })
		.input(z.object({ id: z.string().min(1) }))
		.output(payrollPayslipSchema)
		.handler(({ input, context }) =>
			effectRun(
				context.runtime,
				selfPayslipGet(context.session!.user.id, input.id),
			),
		),
};

export type TSelfRouter = typeof selfRouter;

export const selfRouterBuild = (): TSelfRouter => selfRouter;
