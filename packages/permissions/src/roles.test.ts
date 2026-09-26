import { describe, expect, it } from "vitest";
import { canAll, canAny } from "./can.ts";
import { PERMISSION } from "./permissions.ts";
import { permissionsForRole, ROLE } from "./roles.ts";

describe("permissionsForRole", () => {
	it("grants every permission to superadmin", (): void => {
		const granted = permissionsForRole(ROLE.SUPERADMIN);
		expect(
			canAll(granted, [
				PERMISSION.USER_MANAGE,
				PERMISSION.EMPLOYEE_MANAGE,
				PERMISSION.PAYROLL_CALCULATE,
			]),
		).toBe(true);
	});

	it("grants every permission to admin", (): void => {
		const granted = permissionsForRole(ROLE.ADMIN);
		expect(
			canAll(granted, [
				PERMISSION.USER_MANAGE,
				PERMISSION.EMPLOYEE_MANAGE,
				PERMISSION.PAYROLL_CALCULATE,
			]),
		).toBe(true);
	});

	it("restricts viewer to read-only", (): void => {
		const granted = permissionsForRole(ROLE.VIEWER);
		expect(
			canAny(granted, [
				PERMISSION.USER_MANAGE,
				PERMISSION.EMPLOYEE_MANAGE,
				PERMISSION.PAYROLL_MANAGE,
			]),
		).toBe(false);
	});
});
