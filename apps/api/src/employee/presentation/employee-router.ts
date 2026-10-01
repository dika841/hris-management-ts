import { PERMISSION } from "@app/permissions";
import {
	contractConvertInputSchema,
	contractCreateInputSchema,
	contractPayCompensationInputSchema,
	contractRenewInputSchema,
	departmentCreateInputSchema,
	departmentSchema,
	employeeContractSchema,
	employeeCreateInputSchema,
	employeeIdInputSchema,
	employeeListInputSchema,
	employeeListSchema,
	employeeSchema,
	employeeUpdateInputSchema,
	positionCreateInputSchema,
	positionSchema,
} from "@app/schemas";
import { z } from "zod";
import { contractCompensationPay } from "#/employee/application/contract-compensation-pay.ts";
import { contractConvert } from "#/employee/application/contract-convert.ts";
import { contractCreate } from "#/employee/application/contract-create.ts";
import { contractList } from "#/employee/application/contract-list.ts";
import { contractRenew } from "#/employee/application/contract-renew.ts";
import { departmentCreate } from "#/employee/application/department-create.ts";
import { departmentList } from "#/employee/application/department-list.ts";
import { employeeCreate } from "#/employee/application/employee-create.ts";
import { employeeDelete } from "#/employee/application/employee-delete.ts";
import { employeeGet } from "#/employee/application/employee-get.ts";
import { employeeList } from "#/employee/application/employee-list.ts";
import { employeeUpdate } from "#/employee/application/employee-update.ts";
import { expiringContractsGet } from "#/employee/application/expiring-contracts-get.ts";
import { positionCreate } from "#/employee/application/position-create.ts";
import { positionList } from "#/employee/application/position-list.ts";
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

	// Contracts
	contractList: permissionRequire(PERMISSION.EMPLOYEE_READ)
		.route({ method: HTTP_METHOD.GET, path: ROUTE_PATH.EMPLOYEE_CONTRACTS })
		.input(z.object({ employeeId: z.string() }))
		.output(z.array(employeeContractSchema))
		.handler(({ input, context }) =>
			effectRun(context.runtime, contractList(input.employeeId)),
		),

	contractCreate: permissionRequire(PERMISSION.EMPLOYEE_MANAGE)
		.route({ method: HTTP_METHOD.POST, path: ROUTE_PATH.EMPLOYEE_CONTRACTS })
		.input(contractCreateInputSchema)
		.output(employeeContractSchema)
		.handler(({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				contractCreate(input, context.session!.user.id),
			),
		),

	contractRenew: permissionRequire(PERMISSION.EMPLOYEE_MANAGE)
		.route({
			method: HTTP_METHOD.POST,
			path: ROUTE_PATH.EMPLOYEE_CONTRACT_RENEW,
		})
		.input(contractRenewInputSchema)
		.output(employeeContractSchema)
		.handler(({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				contractRenew(input, context.session!.user.id),
			),
		),

	contractConvert: permissionRequire(PERMISSION.EMPLOYEE_MANAGE)
		.route({
			method: HTTP_METHOD.POST,
			path: ROUTE_PATH.EMPLOYEE_CONTRACT_CONVERT,
		})
		.input(contractConvertInputSchema)
		.output(employeeContractSchema)
		.handler(({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				contractConvert(input, context.session!.user.id),
			),
		),

	contractCompensationPay: permissionRequire(PERMISSION.EMPLOYEE_MANAGE)
		.route({
			method: HTTP_METHOD.POST,
			path: ROUTE_PATH.EMPLOYEE_CONTRACT_COMPENSATION,
		})
		.input(contractPayCompensationInputSchema)
		.output(employeeContractSchema)
		.handler(({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				contractCompensationPay(input, context.session!.user.id),
			),
		),

	expiringContracts: permissionRequire(PERMISSION.EMPLOYEE_READ)
		.route({
			method: HTTP_METHOD.GET,
			path: ROUTE_PATH.EMPLOYEE_EXPIRING_CONTRACTS,
		})
		.input(
			z.object({ days: z.number().int().positive().optional() }).optional(),
		)
		.output(z.array(employeeContractSchema))
		.handler(({ input, context }) =>
			effectRun(context.runtime, expiringContractsGet(input?.days ?? 30)),
		),

	// Organization
	departmentList: permissionRequire(PERMISSION.EMPLOYEE_READ)
		.route({ method: HTTP_METHOD.GET, path: ROUTE_PATH.DEPARTMENTS })
		.input(z.void())
		.output(z.array(departmentSchema))
		.handler(({ context }) => effectRun(context.runtime, departmentList())),

	departmentCreate: permissionRequire(PERMISSION.EMPLOYEE_MANAGE)
		.route({ method: HTTP_METHOD.POST, path: ROUTE_PATH.DEPARTMENTS })
		.input(departmentCreateInputSchema)
		.output(departmentSchema)
		.handler(({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				departmentCreate(input, context.session!.user.id),
			),
		),

	positionList: permissionRequire(PERMISSION.EMPLOYEE_READ)
		.route({ method: HTTP_METHOD.GET, path: ROUTE_PATH.POSITIONS })
		.input(z.void())
		.output(z.array(positionSchema))
		.handler(({ context }) => effectRun(context.runtime, positionList())),

	positionCreate: permissionRequire(PERMISSION.EMPLOYEE_MANAGE)
		.route({ method: HTTP_METHOD.POST, path: ROUTE_PATH.POSITIONS })
		.input(positionCreateInputSchema)
		.output(positionSchema)
		.handler(({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				positionCreate(input, context.session!.user.id),
			),
		),
};

export type TEmployeeRouter = typeof employeeRouter;

export const employeeRouterBuild = (): TEmployeeRouter => employeeRouter;
