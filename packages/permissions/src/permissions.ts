import { A, D } from "@mobily/ts-belt";

export const PERMISSION = {
	USER_MANAGE: "user:manage",
	ACTIVITY_READ: "activity:read",
	EMPLOYEE_READ: "employee:read",
	EMPLOYEE_MANAGE: "employee:manage",
	PAYROLL_READ: "payroll:read",
	PAYROLL_MANAGE: "payroll:manage",
	PAYROLL_CALCULATE: "payroll:calculate",
	// Fase 2: Cuti & Kehadiran
	ATTENDANCE_READ: "attendance:read",
	ATTENDANCE_MANAGE: "attendance:manage",
	LEAVE_READ: "leave:read",
	LEAVE_MANAGE: "leave:manage",
	LEAVE_APPROVE: "leave:approve",
	OVERTIME_READ: "overtime:read",
	OVERTIME_MANAGE: "overtime:manage",
	OVERTIME_APPROVE: "overtime:approve",
} as const;

export type TPermission = (typeof PERMISSION)[keyof typeof PERMISSION];

export const ALL_PERMISSIONS: readonly TPermission[] = D.values(PERMISSION);

export const isPermission = (value: string): value is TPermission =>
	A.some(ALL_PERMISSIONS, (permission) => permission === value);
