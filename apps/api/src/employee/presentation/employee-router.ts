import { PERMISSION } from "@app/permissions";
import {
	employeeCreateInputSchema,
	employeeIdInputSchema,
	employeeListInputSchema,
	employeeListSchema,
	employeeSchema,
	employeeUpdateInputSchema,
} from "@app/schemas";
import { z } from "zod";
import { employeeCreate } from "#/employee/application/employee-create.ts";
import { employeeDelete } from "#/employee/application/employee-delete.ts";
import { employeeGet } from "#/employee/application/employee-get.ts";
import { employeeList } from "#/employee/application/employee-list.ts";
import { employeeUpdate } from "#/employee/application/employee-update.ts";
import { HTTP_METHOD } from "#/platform/http/http-methods.ts";
import { ROUTE_PATH } from "#/platform/http/route-paths.ts";
import { permissionRequire } from "#/platform/orpc/middleware.ts";
import {
	effectRun,
	effectRunTransactional,
} from "#/platform/orpc/run-effect.ts";

const employeeRouter = {
	list: permissionRequire(PERMISSION.EMPLOYEE_READ)
		.route({ method: HTTP_METHOD.GET, path: ROUTE_PATH.EMPLOYEES })
		.input(employeeListInputSchema)
		.output(employeeListSchema)
		.handler(({ input, context }) =>
			effectRun(context.runtime, employeeList(input)),
		),

	get: permissionRequire(PERMISSION.EMPLOYEE_READ)
		.route({ method: HTTP_METHOD.GET, path: ROUTE_PATH.EMPLOYEE })
		.input(employeeIdInputSchema)
		.output(employeeSchema)
		.handler(({ input, context }) =>
			effectRun(context.runtime, employeeGet(input)),
		),

	create: permissionRequire(PERMISSION.EMPLOYEE_MANAGE)
		.route({ method: HTTP_METHOD.POST, path: ROUTE_PATH.EMPLOYEES })
		.input(employeeCreateInputSchema)
		.output(employeeSchema)
		.handler(({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				employeeCreate(input, context.session!.user.id),
			),
		),

	update: permissionRequire(PERMISSION.EMPLOYEE_MANAGE)
		.route({ method: HTTP_METHOD.PATCH, path: ROUTE_PATH.EMPLOYEE })
		.input(employeeUpdateInputSchema)
		.output(employeeSchema)
		.handler(({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				employeeUpdate(input, context.session!.user.id),
			),
		),

	remove: permissionRequire(PERMISSION.EMPLOYEE_MANAGE)
		.route({ method: HTTP_METHOD.DELETE, path: ROUTE_PATH.EMPLOYEE })
		.input(employeeIdInputSchema)
		.output(z.object({ id: z.string() }))
		.handler(({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				employeeDelete(input, context.session!.user.id),
			),
		),
};

export type TEmployeeRouter = typeof employeeRouter;

export const employeeRouterBuild = (): TEmployeeRouter => employeeRouter;
