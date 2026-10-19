import { activityModule } from "#/activity/index.ts";
import { analyticsModule } from "#/analytics/index.ts";
import { featureFlagModule } from "#/feature-flag/index.ts";
import { attendanceModule } from "#/attendance/index.ts";
import { authModule } from "#/auth/index.ts";
import { employeeModule } from "#/employee/index.ts";
import { healthModule } from "#/health/index.ts";
import { notificationModule } from "#/notification/index.ts";
import { payrollModule } from "#/payroll/index.ts";
import { permissionModule } from "#/permission/index.ts";
import { roleModule } from "#/role/index.ts";
import { selfServiceModule } from "#/self-service/index.ts";
import { userModule } from "#/user/index.ts";

const appRouter = {
	health: healthModule.routerBuild(),
	me: authModule.routerBuild(),
	user: userModule.routerBuild(),
	role: roleModule.routerBuild(),
	permission: permissionModule.routerBuild(),
	activity: activityModule.routerBuild(),
	employee: employeeModule.routerBuild(),
	payroll: payrollModule.routerBuild(),
	attendance: attendanceModule.routerBuild(),
	notification: notificationModule.routerBuild(),
	self: selfServiceModule.routerBuild(),
	analytics: analyticsModule.routerBuild(),
	featureFlags: featureFlagModule.routerBuild(),
};

export type TAppRouter = typeof appRouter;

export const routerBuild = (): TAppRouter => appRouter;
