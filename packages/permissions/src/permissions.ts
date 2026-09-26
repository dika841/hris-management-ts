import { A, D } from "@mobily/ts-belt";

export const PERMISSION = {
	USER_MANAGE: "user:manage",
	ACTIVITY_READ: "activity:read",
	EMPLOYEE_READ: "employee:read",
	EMPLOYEE_MANAGE: "employee:manage",
	PAYROLL_READ: "payroll:read",
	PAYROLL_MANAGE: "payroll:manage",
	PAYROLL_CALCULATE: "payroll:calculate",
} as const;

export type TPermission = (typeof PERMISSION)[keyof typeof PERMISSION];

export const ALL_PERMISSIONS: readonly TPermission[] = D.values(PERMISSION);

export const isPermission = (value: string): value is TPermission =>
	A.some(ALL_PERMISSIONS, (permission) => permission === value);
