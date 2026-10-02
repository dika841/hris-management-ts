import { NAV_MESSAGE } from "@app/messages";
import { PERMISSION, type TPermission } from "@app/permissions";
import type { LinkProps } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
	Activity,
	CalendarCheck,
	CircleUser,
	Coins,
	ContactRound,
	KeyRound,
	LayoutDashboard,
	Shield,
	Users,
} from "lucide-react";

export type TNavItemKey =
	| "dashboard"
	| "employees"
	| "attendance"
	| "payroll"
	| "users"
	| "roles"
	| "permissions"
	| "activity"
	| "account";

export type TNavItem = {
	to: LinkProps["to"];
	key: TNavItemKey;
	label: string;
	permissions: readonly TPermission[];
	icon: LucideIcon;
};

export const NAV_ITEMS: readonly TNavItem[] = [
	{
		to: "/dashboard",
		key: "dashboard",
		label: NAV_MESSAGE.DASHBOARD,
		permissions: [],
		icon: LayoutDashboard,
	},
	{
		to: "/employees",
		key: "employees",
		label: NAV_MESSAGE.EMPLOYEES,
		permissions: [PERMISSION.EMPLOYEE_READ],
		icon: ContactRound,
	},
	{
		to: "/attendance",
		key: "attendance",
		label: NAV_MESSAGE.ATTENDANCE,
		permissions: [PERMISSION.ATTENDANCE_READ],
		icon: CalendarCheck,
	},
	{
		to: "/payroll",
		key: "payroll",
		label: NAV_MESSAGE.PAYROLL,
		permissions: [PERMISSION.PAYROLL_READ],
		icon: Coins,
	},
	{
		to: "/users",
		key: "users",
		label: NAV_MESSAGE.USERS,
		permissions: [PERMISSION.USER_MANAGE],
		icon: Users,
	},
	{
		to: "/roles",
		key: "roles",
		label: NAV_MESSAGE.ROLES,
		permissions: [PERMISSION.USER_MANAGE],
		icon: Shield,
	},
	{
		to: "/permissions",
		key: "permissions",
		label: NAV_MESSAGE.PERMISSIONS,
		permissions: [PERMISSION.USER_MANAGE],
		icon: KeyRound,
	},
	{
		to: "/activity",
		key: "activity",
		label: NAV_MESSAGE.ACTIVITY,
		permissions: [PERMISSION.ACTIVITY_READ],
		icon: Activity,
	},
	{
		to: "/account",
		key: "account",
		label: NAV_MESSAGE.ACCOUNT,
		permissions: [],
		icon: CircleUser,
	},
];
