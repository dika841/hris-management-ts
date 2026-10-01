export const ACTIVITY_RESOURCE_TYPE = {
	USER: "user",
	ROLE: "role",
	SESSION: "session",
	EMPLOYEE: "employee",
	PAYROLL: "payroll",
	CONTRACT: "contract",
	DEPARTMENT: "department",
	POSITION: "position",
	LEAVE_TYPE: "leave_type",
	LEAVE_REQUEST: "leave_request",
	ATTENDANCE: "attendance",
	OVERTIME: "overtime",
	PUBLIC_HOLIDAY: "public_holiday",
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
	CONTRACT_CREATE: "contract.create",
	CONTRACT_RENEW: "contract.renew",
	CONTRACT_CONVERT: "contract.convert",
	CONTRACT_COMPENSATION_PAY: "contract.compensation_pay",
	PAYROLL_PERIOD_CREATE: "payroll.period_create",
	PAYROLL_CALCULATE: "payroll.calculate",
	PAYROLL_APPROVE: "payroll.approve",
	// Fase 2: Cuti & Kehadiran
	LEAVE_TYPE_CREATE: "leave_type.create",
	LEAVE_TYPE_UPDATE: "leave_type.update",
	LEAVE_REQUEST_CREATE: "leave_request.create",
	LEAVE_REQUEST_APPROVE: "leave_request.approve",
	LEAVE_REQUEST_REJECT: "leave_request.reject",
	LEAVE_REQUEST_CANCEL: "leave_request.cancel",
	ATTENDANCE_LOG: "attendance.log",
	ATTENDANCE_BULK_LOG: "attendance.bulk_log",
	OVERTIME_CREATE: "overtime.create",
	OVERTIME_APPROVE: "overtime.approve",
	OVERTIME_REJECT: "overtime.reject",
	PUBLIC_HOLIDAY_CREATE: "public_holiday.create",
	PUBLIC_HOLIDAY_DELETE: "public_holiday.delete",
} as const;

export type TActivityAction =
	(typeof ACTIVITY_ACTION)[keyof typeof ACTIVITY_ACTION];
