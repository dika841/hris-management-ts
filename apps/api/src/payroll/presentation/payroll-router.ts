import { PERMISSION } from "@app/permissions";
import {
	payrollBankRowSchema,
	payrollCalculateInputSchema,
	payrollComponentCreateInputSchema,
	payrollComponentDeleteInputSchema,
	payrollComponentListInputSchema,
	payrollComponentSchema,
	payrollItemListInputSchema,
	payrollItemListSchema,
	payrollItemSchema,
	payrollPeriodCreateInputSchema,
	payrollPeriodIdSchema,
	payrollPeriodListInputSchema,
	payrollPeriodListSchema,
	payrollPeriodSchema,
	payrollPeriodStatusUpdateInputSchema,
	payrollPayslipSchema,
	taxSimulationInputSchema,
	taxSimulationResultSchema,
} from "@app/schemas";
import { z } from "zod";
import { payrollBankExport } from "#/payroll/application/payroll-bank-export.ts";
import { payrollCalculatePeriod } from "#/payroll/application/payroll-calculate-period.ts";
import { payrollComponentCreate } from "#/payroll/application/payroll-component-create.ts";
import { payrollComponentDelete } from "#/payroll/application/payroll-component-delete.ts";
import { payrollComponentList } from "#/payroll/application/payroll-component-list.ts";
import { payrollItemGet } from "#/payroll/application/payroll-item-get.ts";
import { payrollItemList } from "#/payroll/application/payroll-item-list.ts";
import { payrollPayslipGet } from "#/payroll/application/payroll-payslip-get.ts";
import { payrollPayslipSend } from "#/payroll/application/payroll-payslip-send.ts";
import { payrollReportItems } from "#/payroll/application/payroll-report-items.ts";
import { payrollPeriodCreate } from "#/payroll/application/payroll-period-create.ts";
import { payrollPeriodGet } from "#/payroll/application/payroll-period-get.ts";
import { payrollPeriodList } from "#/payroll/application/payroll-period-list.ts";
import { payrollPeriodStatusUpdate } from "#/payroll/application/payroll-period-status-update.ts";
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

	updateStatus: permissionRequire(PERMISSION.PAYROLL_MANAGE)
		.route({
			method: HTTP_METHOD.PATCH,
			path: ROUTE_PATH.PAYROLL_PERIOD_STATUS,
		})
		.input(payrollPeriodStatusUpdateInputSchema)
		.output(payrollPeriodSchema)
		.handler(({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				payrollPeriodStatusUpdate(input, context.session!.user.id),
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

	getItem: permissionRequire(PERMISSION.PAYROLL_READ)
		.route({ method: HTTP_METHOD.GET, path: ROUTE_PATH.PAYROLL_ITEM })
		.input(z.object({ id: z.string().min(1) }))
		.output(payrollItemSchema)
		.handler(({ input, context }) =>
			effectRun(context.runtime, payrollItemGet(input.id)),
		),

	sendPayslip: permissionRequire(PERMISSION.PAYROLL_MANAGE)
		.route({ method: HTTP_METHOD.POST, path: ROUTE_PATH.PAYROLL_PAYSLIP_SEND })
		.input(z.object({ id: z.string().min(1) }))
		.output(z.object({ sent: z.boolean() }))
		.handler(({ input, context }) =>
			effectRun(
				context.runtime,
				payrollPayslipSend(input.id, context.session!.user.id),
			),
		),

	getPayslip: permissionRequire(PERMISSION.PAYROLL_READ)
		.route({ method: HTTP_METHOD.GET, path: ROUTE_PATH.PAYROLL_PAYSLIP })
		.input(z.object({ id: z.string().min(1) }))
		.output(payrollPayslipSchema)
		.handler(({ input, context }) =>
			effectRun(
				context.runtime,
				payrollPayslipGet(input.id, context.session!.user.id),
			),
		),

	listComponents: permissionRequire(PERMISSION.PAYROLL_READ)
		.route({ method: HTTP_METHOD.GET, path: ROUTE_PATH.PAYROLL_COMPONENTS })
		.input(payrollComponentListInputSchema)
		.output(z.array(payrollComponentSchema))
		.handler(({ input, context }) =>
			effectRun(context.runtime, payrollComponentList(input.periodId)),
		),

	createComponent: permissionRequire(PERMISSION.PAYROLL_MANAGE)
		.route({ method: HTTP_METHOD.POST, path: ROUTE_PATH.PAYROLL_COMPONENTS })
		.input(payrollComponentCreateInputSchema)
		.output(payrollComponentSchema)
		.handler(({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				payrollComponentCreate(input, context.session!.user.id),
			),
		),

	deleteComponent: permissionRequire(PERMISSION.PAYROLL_MANAGE)
		.route({ method: HTTP_METHOD.DELETE, path: ROUTE_PATH.PAYROLL_COMPONENT })
		.input(payrollComponentDeleteInputSchema)
		.output(z.object({ id: z.string() }))
		.handler(({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				payrollComponentDelete(input, context.session!.user.id),
			),
		),

	reportItems: permissionRequire(PERMISSION.PAYROLL_READ)
		.route({ method: HTTP_METHOD.GET, path: ROUTE_PATH.PAYROLL_REPORT_ITEMS })
		.input(z.object({ id: z.string().min(1) }))
		.output(z.array(payrollItemSchema))
		.handler(({ input, context }) =>
			effectRun(context.runtime, payrollReportItems(input.id)),
		),

	bankExport: permissionRequire(PERMISSION.PAYROLL_READ)
		.route({ method: HTTP_METHOD.GET, path: ROUTE_PATH.PAYROLL_BANK_EXPORT })
		.input(z.object({ id: z.string().min(1) }))
		.output(z.array(payrollBankRowSchema))
		.handler(({ input, context }) =>
			effectRun(context.runtime, payrollBankExport(input.id)),
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
