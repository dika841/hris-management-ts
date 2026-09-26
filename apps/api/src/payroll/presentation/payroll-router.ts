import { PERMISSION } from "@app/permissions";
import {
	payrollCalculateInputSchema,
	payrollItemListInputSchema,
	payrollItemListSchema,
	payrollPeriodCreateInputSchema,
	payrollPeriodIdSchema,
	payrollPeriodListInputSchema,
	payrollPeriodListSchema,
	payrollPeriodSchema,
	taxSimulationInputSchema,
	taxSimulationResultSchema,
} from "@app/schemas";
import { z } from "zod";
import { payrollCalculatePeriod } from "#/payroll/application/payroll-calculate-period.ts";
import { payrollItemList } from "#/payroll/application/payroll-item-list.ts";
import { payrollPeriodCreate } from "#/payroll/application/payroll-period-create.ts";
import { payrollPeriodGet } from "#/payroll/application/payroll-period-get.ts";
import { payrollPeriodList } from "#/payroll/application/payroll-period-list.ts";
import { payrollTaxSimulate } from "#/payroll/application/payroll-tax-simulate.ts";
import { HTTP_METHOD } from "#/platform/http/http-methods.ts";
import { ROUTE_PATH } from "#/platform/http/route-paths.ts";
import { permissionRequire } from "#/platform/orpc/middleware.ts";
import {
	effectRun,
	effectRunTransactional,
} from "#/platform/orpc/run-effect.ts";

const payrollRouter = {
	listPeriods: permissionRequire(PERMISSION.PAYROLL_READ)
		.route({ method: HTTP_METHOD.GET, path: ROUTE_PATH.PAYROLL_PERIODS })
		.input(payrollPeriodListInputSchema)
		.output(payrollPeriodListSchema)
		.handler(({ input, context }) =>
			effectRun(context.runtime, payrollPeriodList(input)),
		),

	getPeriod: permissionRequire(PERMISSION.PAYROLL_READ)
		.route({ method: HTTP_METHOD.GET, path: ROUTE_PATH.PAYROLL_PERIOD })
		.input(z.object({ id: payrollPeriodIdSchema }))
		.output(payrollPeriodSchema)
		.handler(({ input, context }) =>
			effectRun(context.runtime, payrollPeriodGet(input.id)),
		),

	createPeriod: permissionRequire(PERMISSION.PAYROLL_MANAGE)
		.route({ method: HTTP_METHOD.POST, path: ROUTE_PATH.PAYROLL_PERIODS })
		.input(payrollPeriodCreateInputSchema)
		.output(payrollPeriodSchema)
		.handler(({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				payrollPeriodCreate(input, context.session!.user.id),
			),
		),

	calculate: permissionRequire(PERMISSION.PAYROLL_CALCULATE)
		.route({ method: HTTP_METHOD.POST, path: ROUTE_PATH.PAYROLL_CALCULATE })
		.input(payrollCalculateInputSchema)
		.output(payrollPeriodSchema)
		.handler(({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				payrollCalculatePeriod(input, context.session!.user.id),
			),
		),

	listItems: permissionRequire(PERMISSION.PAYROLL_READ)
		.route({ method: HTTP_METHOD.GET, path: ROUTE_PATH.PAYROLL_ITEMS })
		.input(payrollItemListInputSchema)
		.output(payrollItemListSchema)
		.handler(({ input, context }) =>
			effectRun(context.runtime, payrollItemList(input)),
		),

	simulate: permissionRequire(PERMISSION.PAYROLL_READ)
		.route({ method: HTTP_METHOD.POST, path: ROUTE_PATH.PAYROLL_SIMULATE })
		.input(taxSimulationInputSchema)
		.output(taxSimulationResultSchema)
		.handler(({ input, context }) =>
			effectRun(context.runtime, payrollTaxSimulate(input)),
		),
};

export type TPayrollRouter = typeof payrollRouter;

export const payrollRouterBuild = (): TPayrollRouter => payrollRouter;
