export const ACTIVITY_RESOURCE_TYPE = {
	USER: "user",
	ROLE: "role",
	SESSION: "session",
	EMPLOYEE: "employee",
	PAYROLL: "payroll",
} as const;

export type TActivityResourceType =
	(typeof ACTIVITY_RESOURCE_TYPE)[keyof typeof ACTIVITY_RESOURCE_TYPE];

export const ACTIVITY_ACTION = {
	USER_CREATE: "user.create",
	USER_UPDATE: "user.update",
	USER_DELETE: "user.delete",
	USER_PASSWORD_RESET: "user.password_reset",
	ROLE_CREATE: "role.create",
	ROLE_UPDATE: "role.update",
	ROLE_DELETE: "role.delete",
	SESSION_CREATE: "session.create",
	EMPLOYEE_CREATE: "employee.create",
	EMPLOYEE_UPDATE: "employee.update",
	EMPLOYEE_DELETE: "employee.delete",
	PAYROLL_PERIOD_CREATE: "payroll.period_create",
	PAYROLL_CALCULATE: "payroll.calculate",
	PAYROLL_APPROVE: "payroll.approve",
} as const;

export type TActivityAction =
	(typeof ACTIVITY_ACTION)[keyof typeof ACTIVITY_ACTION];
