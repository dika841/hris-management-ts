import {
	type UseMutationResult,
	type UseQueryResult,
	useQuery,
} from "@tanstack/react-query";
import { orpc } from "#/libs/orpc/client.ts";
import { useProcedureMutation } from "#/libs/orpc/procedure-mutation.ts";
import type {
	TClientErrors,
	TClientInputs,
	TClientOutputs,
} from "#/libs/orpc/types.ts";

type TSelfIn = TClientInputs["self"];
type TSelfOut = TClientOutputs["self"];
type TSelfErr = TClientErrors["self"];

export const selfKeys = (): readonly (readonly unknown[])[] => [
	orpc.self.key(),
];

export const useSelfProfile = (): UseQueryResult<TSelfOut["profile"]> =>
	useQuery({
		...orpc.self.profile.queryOptions({
			queryKey: orpc.self.profile.key(),
		}),
		queryKey: orpc.self.profile.key(),
		retry: false,
	});

export const useSelfAttendanceList = (
	input: TSelfIn["attendanceList"],
	enabled: boolean,
): UseQueryResult<TSelfOut["attendanceList"]> =>
	useQuery({
		...orpc.self.attendanceList.queryOptions({ input }),
		queryKey: orpc.self.attendanceList.key({ input }),
		enabled,
	});

export const useSelfAttendanceSummary = (
	input: TSelfIn["attendanceSummary"],
	enabled: boolean,
): UseQueryResult<TSelfOut["attendanceSummary"]> =>
	useQuery({
		...orpc.self.attendanceSummary.queryOptions({ input }),
		queryKey: orpc.self.attendanceSummary.key({ input }),
		enabled,
	});

export const useSelfClockIn = (): UseMutationResult<
	TSelfOut["clockIn"],
	TSelfErr["clockIn"],
	TSelfIn["clockIn"]
> =>
	useProcedureMutation(orpc.self.clockIn, {
		message: "Clock-in recorded.",
		invalidates: selfKeys(),
	});

export const useSelfClockOut = (): UseMutationResult<
	TSelfOut["clockOut"],
	TSelfErr["clockOut"],
	TSelfIn["clockOut"]
> =>
	useProcedureMutation(orpc.self.clockOut, {
		message: "Clock-out recorded.",
		invalidates: selfKeys(),
	});

export const useSelfLeaveTypes = (
	enabled: boolean,
): UseQueryResult<TSelfOut["leaveTypes"]> =>
	useQuery({
		...orpc.self.leaveTypes.queryOptions({
			queryKey: orpc.self.leaveTypes.key(),
		}),
		queryKey: orpc.self.leaveTypes.key(),
		enabled,
	});

export const useSelfLeaveBalances = (
	year: number,
	enabled: boolean,
): UseQueryResult<TSelfOut["leaveBalances"]> =>
	useQuery({
		...orpc.self.leaveBalances.queryOptions({ input: { year } }),
		queryKey: orpc.self.leaveBalances.key({ input: { year } }),
		enabled,
	});

export const useSelfLeaveList = (
	input: TSelfIn["leaveList"],
	enabled: boolean,
): UseQueryResult<TSelfOut["leaveList"]> =>
	useQuery({
		...orpc.self.leaveList.queryOptions({ input }),
		queryKey: orpc.self.leaveList.key({ input }),
		enabled,
	});

export const useSelfLeaveCreate = (): UseMutationResult<
	TSelfOut["leaveCreate"],
	TSelfErr["leaveCreate"],
	TSelfIn["leaveCreate"]
> =>
	useProcedureMutation(orpc.self.leaveCreate, {
		message: "Leave request submitted.",
		invalidates: selfKeys(),
	});

export const useSelfLeaveCancel = (): UseMutationResult<
	TSelfOut["leaveCancel"],
	TSelfErr["leaveCancel"],
	TSelfIn["leaveCancel"]
> =>
	useProcedureMutation(orpc.self.leaveCancel, {
		message: "Leave request cancelled.",
		invalidates: selfKeys(),
	});

export const useSelfOvertimeList = (
	input: TSelfIn["overtimeList"],
	enabled: boolean,
): UseQueryResult<TSelfOut["overtimeList"]> =>
	useQuery({
		...orpc.self.overtimeList.queryOptions({ input }),
		queryKey: orpc.self.overtimeList.key({ input }),
		enabled,
	});

export const useSelfOvertimeCreate = (): UseMutationResult<
	TSelfOut["overtimeCreate"],
	TSelfErr["overtimeCreate"],
	TSelfIn["overtimeCreate"]
> =>
	useProcedureMutation(orpc.self.overtimeCreate, {
		message: "Overtime request submitted.",
		invalidates: selfKeys(),
	});

export const useSelfOvertimeCancel = (): UseMutationResult<
	TSelfOut["overtimeCancel"],
	TSelfErr["overtimeCancel"],
	TSelfIn["overtimeCancel"]
> =>
	useProcedureMutation(orpc.self.overtimeCancel, {
		message: "Overtime request cancelled.",
		invalidates: selfKeys(),
	});

export const useSelfPayslipList = (
	enabled: boolean,
): UseQueryResult<TSelfOut["payslipList"]> =>
	useQuery({
		...orpc.self.payslipList.queryOptions({
			queryKey: orpc.self.payslipList.key(),
		}),
		queryKey: orpc.self.payslipList.key(),
		enabled,
	});

export const useSelfPayslipGet = (
	id: string,
): UseQueryResult<TSelfOut["payslipGet"]> =>
	useQuery({
		...orpc.self.payslipGet.queryOptions({ input: { id } }),
		queryKey: orpc.self.payslipGet.key({ input: { id } }),
		retry: false,
	});
