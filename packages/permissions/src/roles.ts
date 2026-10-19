import { A, D } from "@mobily/ts-belt";
import {
	ALL_PERMISSIONS,
	PERMISSION,
	type TPermission,
} from "./permissions.ts";

export const ROLE = {
	SUPERADMIN: "superadmin",
	ADMIN: "admin",
	MEMBER: "member",
	VIEWER: "viewer",
} as const;

export type TRole = (typeof ROLE)[keyof typeof ROLE];

export const isRole = (value: string): value is TRole =>
	A.some(D.values(ROLE), (role) => role === value);

const ADMIN_PERMISSIONS = ALL_PERMISSIONS.filter(
	(permission) => permission !== PERMISSION.FEATURE_FLAG_MANAGE,
);

export const ROLE_PERMISSIONS: Record<TRole, readonly TPermission[]> = {
	[ROLE.SUPERADMIN]: ALL_PERMISSIONS,
	[ROLE.ADMIN]: ADMIN_PERMISSIONS,
	[ROLE.MEMBER]: [],
	[ROLE.VIEWER]: [],
};

export const permissionsForRole = (role: TRole): readonly TPermission[] =>
	D.get(ROLE_PERMISSIONS, role) ?? [];
