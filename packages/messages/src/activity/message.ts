import {
	ACTIVITY_ACTION,
	ACTIVITY_RESOURCE_TYPE,
	type TActivityAction,
	type TActivityResourceType,
} from "@app/activity";

export const ACTIVITY_MESSAGE = {
	TITLE: "Activity",
	EMPTY: "No activity yet.",
	PAGINATION_NOUN: "entries",
	FILTER_ACTION: "Action",
	FILTER_ACTION_ALL: "All actions",
	FILTER_ENTITY: "Entity",
	FILTER_ENTITY_ALL: "All entities",
	COLUMN_WHEN: "When",
	COLUMN_ACTOR: "Actor",
	COLUMN_ACTION: "Action",
	COLUMN_ENTITY: "Entity",
	COLUMN_DETAILS: "Details",
} as const;

export const ACTIVITY_ACTION_LABEL = {
	[ACTIVITY_ACTION.USER_CREATE]: "User created",
	[ACTIVITY_ACTION.USER_UPDATE]: "User updated",
	[ACTIVITY_ACTION.USER_DELETE]: "User deleted",
	[ACTIVITY_ACTION.USER_PASSWORD_RESET]: "Password reset",
	[ACTIVITY_ACTION.ROLE_CREATE]: "Role created",
	[ACTIVITY_ACTION.ROLE_UPDATE]: "Role updated",
	[ACTIVITY_ACTION.ROLE_DELETE]: "Role deleted",
	[ACTIVITY_ACTION.SESSION_CREATE]: "Signed in",
	[ACTIVITY_ACTION.EMPLOYEE_CREATE]: "Employee created",
	[ACTIVITY_ACTION.EMPLOYEE_UPDATE]: "Employee updated",
	[ACTIVITY_ACTION.EMPLOYEE_DELETE]: "Employee deleted",
	[ACTIVITY_ACTION.PAYROLL_PERIOD_CREATE]: "Payroll period created",
	[ACTIVITY_ACTION.PAYROLL_CALCULATE]: "Payroll calculated",
	[ACTIVITY_ACTION.PAYROLL_APPROVE]: "Payroll approved",
} as const satisfies Record<TActivityAction, string>;

export const ACTIVITY_ENTITY_LABEL = {
	[ACTIVITY_RESOURCE_TYPE.USER]: "User",
	[ACTIVITY_RESOURCE_TYPE.ROLE]: "Role",
	[ACTIVITY_RESOURCE_TYPE.SESSION]: "Session",
	[ACTIVITY_RESOURCE_TYPE.EMPLOYEE]: "Employee",
	[ACTIVITY_RESOURCE_TYPE.PAYROLL]: "Payroll",
} as const satisfies Record<TActivityResourceType, string>;
