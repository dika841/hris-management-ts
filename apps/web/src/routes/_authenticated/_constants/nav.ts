import { NAV_MESSAGE } from "@app/messages";
import { PERMISSION, type TPermission } from "@app/permissions";
import type { LinkProps } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
	Activity,
	BarChart3,
	Building2,
	CalendarCheck,
	CircleUser,
	Coins,
	ContactRound,
	Flag,
	KeyRound,
	UserRound,
	LayoutDashboard,
	Shield,
	ShieldCheck,
	Sparkles,
	Users,
} from "lucide-react";

export type TNavItemKey =
	| "dashboard"
	| "analytics"
	| "featureFlags"
	| "aiGovernance"
	| "aiAssistant"
	| "employees"
	| "organization"
	| "attendance"
	| "payroll"
	| "users"
	| "roles"
	| "permissions"
	| "activity"
	| "me"
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
		to: "/analytics",
		key: "analytics",
		label: NAV_MESSAGE.ANALYTICS,
		permissions: [PERMISSION.EMPLOYEE_READ],
		icon: BarChart3,
	},
	{
		to: "/employees",
		key: "employees",
		label: NAV_MESSAGE.EMPLOYEES,
		permissions: [PERMISSION.EMPLOYEE_READ],
		icon: ContactRound,
	},
	{
		to: "/organization",
		key: "organization",
		label: NAV_MESSAGE.ORGANIZATION,
		permissions: [PERMISSION.EMPLOYEE_MANAGE],
		icon: Building2,
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
		to: "/ai-assistant",
		key: "aiAssistant",
		label: "AI Assistant",
		permissions: [PERMISSION.AI_GOVERNANCE_MANAGE],
		icon: Sparkles,
	},
	{
		to: "/ai-governance",
		key: "aiGovernance",
		label: "AI Governance",
		permissions: [PERMISSION.AI_GOVERNANCE_READ],
		icon: ShieldCheck,
	},
	{
		to: "/feature-flags",
		key: "featureFlags",
		label: NAV_MESSAGE.FEATURE_FLAGS,
		permissions: [PERMISSION.USER_MANAGE],
		icon: Flag,
	},
	{
		to: "/activity",
		key: "activity",
		label: NAV_MESSAGE.ACTIVITY,
		permissions: [PERMISSION.ACTIVITY_READ],
		icon: Activity,
	},
	{
		to: "/me",
		key: "me",
		label: NAV_MESSAGE.MY_SPACE,
		permissions: [],
		icon: UserRound,
	},
	{
		to: "/account",
		key: "account",
		label: NAV_MESSAGE.ACCOUNT,
		permissions: [],
		icon: CircleUser,
	},
];
