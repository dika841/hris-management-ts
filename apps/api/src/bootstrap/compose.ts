import { Layer, ManagedRuntime } from "effect";
import { activityModule } from "#/activity/index.ts";
import { attendanceModule } from "#/attendance/index.ts";
import { authModule } from "#/auth/index.ts";
import { employeeModule } from "#/employee/index.ts";
import { healthModule } from "#/health/index.ts";
import { payrollModule } from "#/payroll/index.ts";
import { cacheServiceLayer } from "#/platform/cache/redis.ts";
import { dbServiceLayer } from "#/platform/db/db-service.ts";
import { mailServiceLayer } from "#/platform/mail/mailer.ts";
import { queueServiceLayer } from "#/platform/queue/rabbitmq.ts";
import { roleModule } from "#/role/index.ts";
import { userModule } from "#/user/index.ts";

export const AppLayer = Layer.mergeAll(
	dbServiceLayer,
	cacheServiceLayer,
	queueServiceLayer,
	mailServiceLayer,
	healthModule.layer,
	activityModule.layer,
	roleModule.layer,
	userModule.layer,
	authModule.layer,
	employeeModule.layer,
	payrollModule.layer,
	attendanceModule.layer,
) as Layer.Layer<
	| Layer.Success<typeof dbServiceLayer>
	| Layer.Success<typeof cacheServiceLayer>
	| Layer.Success<typeof queueServiceLayer>
	| Layer.Success<typeof mailServiceLayer>
	| Layer.Success<typeof healthModule.layer>
	| Layer.Success<typeof activityModule.layer>
	| Layer.Success<typeof roleModule.layer>
	| Layer.Success<typeof userModule.layer>
	| Layer.Success<typeof authModule.layer>
	| Layer.Success<typeof employeeModule.layer>
	| Layer.Success<typeof payrollModule.layer>
	| Layer.Success<typeof attendanceModule.layer>
>;

export const appMemoMap = Layer.makeMemoMapUnsafe();

export const runtime = ManagedRuntime.make(AppLayer, { memoMap: appMemoMap });

export type TAppRuntime = typeof runtime;

export type TAppRuntimeServices = Layer.Success<typeof AppLayer>;
