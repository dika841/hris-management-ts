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

export type TNavItem = {
	to: LinkProps["to"];
	label: string;
	permissions: readonly TPermission[];
	icon: LucideIcon;
};

export const NAV_ITEMS: readonly TNavItem[] = [
	{
		to: "/dashboard",
		label: NAV_MESSAGE.DASHBOARD,
		permissions: [],
		icon: LayoutDashboard,
	},
	{
		to: "/employees",
		label: NAV_MESSAGE.EMPLOYEES,
		permissions: [PERMISSION.EMPLOYEE_READ],
		icon: ContactRound,
	},
	{
		to: "/attendance",
		label: NAV_MESSAGE.ATTENDANCE,
		permissions: [PERMISSION.ATTENDANCE_READ],
		icon: CalendarCheck,
	},
	{
		to: "/payroll",
		label: NAV_MESSAGE.PAYROLL,
		permissions: [PERMISSION.PAYROLL_READ],
		icon: Coins,
	},
	{
		to: "/users",
		label: NAV_MESSAGE.USERS,
		permissions: [PERMISSION.USER_MANAGE],
		icon: Users,
	},
	{
		to: "/roles",
		label: NAV_MESSAGE.ROLES,
		permissions: [PERMISSION.USER_MANAGE],
		icon: Shield,
	},
	{
		to: "/permissions",
		label: NAV_MESSAGE.PERMISSIONS,
		permissions: [PERMISSION.USER_MANAGE],
		icon: KeyRound,
	},
	{
		to: "/activity",
		label: NAV_MESSAGE.ACTIVITY,
		permissions: [PERMISSION.ACTIVITY_READ],
		icon: Activity,
	},
	{
		to: "/account",
		label: NAV_MESSAGE.ACCOUNT,
		permissions: [],
		icon: CircleUser,
	},
];
