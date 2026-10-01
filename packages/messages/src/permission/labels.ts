import type { TPermission, TRole } from "@app/permissions";

export const PERMISSION_LABEL = {
	"user:manage": "Manage users",
	"activity:read": "View the activity log",
	"employee:read": "View employees",
	"employee:manage": "Manage employees",
	"payroll:read": "View payroll and payslips",
	"payroll:manage": "Manage payroll periods",
	"payroll:calculate": "Run payroll and tax calculations",
	// Fase 2
	"attendance:read": "View attendance records",
	"attendance:manage": "Manage attendance records",
	"leave:read": "View leave requests",
	"leave:manage": "Submit and cancel leave requests",
	"leave:approve": "Approve or reject leave requests",
	"overtime:read": "View overtime requests",
	"overtime:manage": "Submit overtime requests",
	"overtime:approve": "Approve or reject overtime requests",
} as const satisfies Record<TPermission, string>;

export const ROLE_LABEL = {
	superadmin: "Superadmin",
	admin: "Admin",
	member: "Member",
	viewer: "Viewer",
} as const satisfies Record<TRole, string>;

export const ROLE_DESCRIPTION = {
	superadmin: "Full access, including ownership bypass.",
	admin: "Full access, including user and role management.",
	member: "Standard member access.",
	viewer: "Read-only access.",
} as const satisfies Record<TRole, string>;

const isLabelledRole = (role: string): role is TRole =>
	Object.hasOwn(ROLE_LABEL, role);

export const roleLabel = (role: string): string =>
	isLabelledRole(role) ? ROLE_LABEL[role] : role;
