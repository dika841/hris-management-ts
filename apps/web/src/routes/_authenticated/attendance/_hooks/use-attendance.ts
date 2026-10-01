import { ATTENDANCE_MESSAGE } from "@app/messages";
import type {
	TAttendanceListInput,
	TLeaveRequestListInput,
	TOvertimeListInput,
	TPublicHolidayListInput,
} from "@app/schemas";
import {
	type UseMutationResult,
	type UseSuspenseQueryOptions,
	type UseSuspenseQueryResult,
	useMutation,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { orpc } from "#/libs/orpc/client.ts";
import { useProcedureMutation } from "#/libs/orpc/procedure-mutation.ts";
import { suspenseQueryOptionsFor } from "#/libs/orpc/procedure-query.ts";
import { toastError } from "#/libs/orpc/toast-error.ts";
import type {
	TClientErrors,
	TClientInputs,
	TClientOutputs,
} from "#/libs/orpc/types.ts";

type TAttendanceIn = TClientInputs["attendance"];
type TAttendanceOut = TClientOutputs["attendance"];
type TAttendanceErr = TClientErrors["attendance"];

export const attendanceKeys = (): readonly (readonly unknown[])[] => [
	orpc.attendance.key(),
];

// 1. Attendance Log
export const attendanceListOptions = (
	input: TAttendanceListInput,
): UseSuspenseQueryOptions<TAttendanceOut["attendanceList"]> =>
	suspenseQueryOptionsFor(orpc.attendance.attendanceList, input);

export const useAttendanceList = (
	input: TAttendanceListInput,
): UseSuspenseQueryResult<TAttendanceOut["attendanceList"]> =>
	useSuspenseQuery(attendanceListOptions(input));

export const useAttendanceLog = (): UseMutationResult<
	TAttendanceOut["attendanceLog"],
	TAttendanceErr["attendanceLog"],
	TAttendanceIn["attendanceLog"]
> =>
	useProcedureMutation(orpc.attendance.attendanceLog, {
		message: ATTENDANCE_MESSAGE.ATTENDANCE_LOGGED,
		invalidates: attendanceKeys(),
	});

// 2. Leave Types & Requests
export const leaveTypeListOptions = (): UseSuspenseQueryOptions<
	TAttendanceOut["leaveTypeList"]
> => suspenseQueryOptionsFor(orpc.attendance.leaveTypeList, undefined);

export const useLeaveTypeList = (): UseSuspenseQueryResult<
	TAttendanceOut["leaveTypeList"]
> => useSuspenseQuery(leaveTypeListOptions());

export const useLeaveTypeCreate = (): UseMutationResult<
	TAttendanceOut["leaveTypeCreate"],
	TAttendanceErr["leaveTypeCreate"],
	TAttendanceIn["leaveTypeCreate"]
> =>
	useProcedureMutation(orpc.attendance.leaveTypeCreate, {
		message: ATTENDANCE_MESSAGE.LEAVE_TYPE_CREATED,
		invalidates: attendanceKeys(),
	});

export const leaveRequestListOptions = (
	input: TLeaveRequestListInput,
): UseSuspenseQueryOptions<TAttendanceOut["leaveRequestList"]> =>
	suspenseQueryOptionsFor(orpc.attendance.leaveRequestList, input);

export const useLeaveRequestList = (
	input: TLeaveRequestListInput,
): UseSuspenseQueryResult<TAttendanceOut["leaveRequestList"]> =>
	useSuspenseQuery(leaveRequestListOptions(input));

export const useLeaveRequestCreate = (): UseMutationResult<
	TAttendanceOut["leaveRequestCreate"],
	TAttendanceErr["leaveRequestCreate"],
	TAttendanceIn["leaveRequestCreate"]
> =>
	useProcedureMutation(orpc.attendance.leaveRequestCreate, {
		message: ATTENDANCE_MESSAGE.LEAVE_REQUEST_CREATED,
		invalidates: attendanceKeys(),
	});

export const useLeaveRequestApprove = (): UseMutationResult<
	TAttendanceOut["leaveRequestApprove"],
	TAttendanceErr["leaveRequestApprove"],
	TAttendanceIn["leaveRequestApprove"]
> =>
	useProcedureMutation(orpc.attendance.leaveRequestApprove, {
		message: ATTENDANCE_MESSAGE.LEAVE_REQUEST_APPROVED,
		invalidates: attendanceKeys(),
	});

export const useLeaveRequestReject = (): UseMutationResult<
	TAttendanceOut["leaveRequestReject"],
	TAttendanceErr["leaveRequestReject"],
	TAttendanceIn["leaveRequestReject"]
> =>
	useProcedureMutation(orpc.attendance.leaveRequestReject, {
		message: ATTENDANCE_MESSAGE.LEAVE_REQUEST_REJECTED,
		invalidates: attendanceKeys(),
	});

export const useLeaveRequestCancel = (): UseMutationResult<
	TAttendanceOut["leaveRequestCancel"],
	TAttendanceErr["leaveRequestCancel"],
	TAttendanceIn["leaveRequestCancel"]
> =>
	useProcedureMutation(orpc.attendance.leaveRequestCancel, {
		message: ATTENDANCE_MESSAGE.LEAVE_REQUEST_CANCELLED,
		invalidates: attendanceKeys(),
	});

// 3. Overtime
export const overtimeListOptions = (
	input: TOvertimeListInput,
): UseSuspenseQueryOptions<TAttendanceOut["overtimeList"]> =>
	suspenseQueryOptionsFor(orpc.attendance.overtimeList, input);

export const useOvertimeList = (
	input: TOvertimeListInput,
): UseSuspenseQueryResult<TAttendanceOut["overtimeList"]> =>
	useSuspenseQuery(overtimeListOptions(input));

export const useOvertimeCreate = (): UseMutationResult<
	TAttendanceOut["overtimeCreate"],
	TAttendanceErr["overtimeCreate"],
	TAttendanceIn["overtimeCreate"]
> =>
	useProcedureMutation(orpc.attendance.overtimeCreate, {
		message: ATTENDANCE_MESSAGE.OVERTIME_CREATED,
		invalidates: attendanceKeys(),
	});

export const useOvertimeCalculate = () =>
	useMutation({
		...orpc.attendance.overtimeCalculate.mutationOptions(),
		onError: toastError,
	});

export const useOvertimeApprove = (): UseMutationResult<
	TAttendanceOut["overtimeApprove"],
	TAttendanceErr["overtimeApprove"],
	TAttendanceIn["overtimeApprove"]
> =>
	useProcedureMutation(orpc.attendance.overtimeApprove, {
		message: ATTENDANCE_MESSAGE.OVERTIME_APPROVED,
		invalidates: attendanceKeys(),
	});

export const useOvertimeReject = (): UseMutationResult<
	TAttendanceOut["overtimeReject"],
	TAttendanceErr["overtimeReject"],
	TAttendanceIn["overtimeReject"]
> =>
	useProcedureMutation(orpc.attendance.overtimeReject, {
		message: ATTENDANCE_MESSAGE.OVERTIME_REJECTED,
		invalidates: attendanceKeys(),
	});

// 4. Public Holidays
export const publicHolidayListOptions = (
	input: TPublicHolidayListInput,
): UseSuspenseQueryOptions<TAttendanceOut["publicHolidayList"]> =>
	suspenseQueryOptionsFor(orpc.attendance.publicHolidayList, input);

export const usePublicHolidayList = (
	input: TPublicHolidayListInput,
): UseSuspenseQueryResult<TAttendanceOut["publicHolidayList"]> =>
	useSuspenseQuery(publicHolidayListOptions(input));

export const usePublicHolidayCreate = (): UseMutationResult<
	TAttendanceOut["publicHolidayCreate"],
	TAttendanceErr["publicHolidayCreate"],
	TAttendanceIn["publicHolidayCreate"]
> =>
	useProcedureMutation(orpc.attendance.publicHolidayCreate, {
		message: ATTENDANCE_MESSAGE.HOLIDAY_CREATED,
		invalidates: attendanceKeys(),
	});
