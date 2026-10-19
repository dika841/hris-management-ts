import { PAYROLL_MESSAGE } from "@app/messages";
import type { TPayrollPeriodListInput, TPayrollSort } from "@app/schemas";
import { D } from "@mobily/ts-belt";
import {
	type UseMutationResult,
	type UseQueryResult,
	type UseSuspenseQueryOptions,
	type UseSuspenseQueryResult,
	useQuery,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { orpc } from "#/libs/orpc/client.ts";
import { useProcedureMutation } from "#/libs/orpc/procedure-mutation.ts";
import { suspenseQueryOptionsFor } from "#/libs/orpc/procedure-query.ts";
import type {
	TClientErrors,
	TClientInputs,
	TClientOutputs,
} from "#/libs/orpc/types.ts";
import type { TListChange } from "#/libs/table/list-patch.ts";

type TPayrollIn = TClientInputs["payroll"];
type TPayrollOut = TClientOutputs["payroll"];
type TPayrollErr = TClientErrors["payroll"];

const listRouteApi = getRouteApi("/_authenticated/payroll/");

export const payrollKeys = (): readonly (readonly unknown[])[] => [
	orpc.payroll.key(),
];

export const payrollPeriodListOptions = (
	input: TPayrollPeriodListInput,
): UseSuspenseQueryOptions<TPayrollOut["listPeriods"]> =>
	suspenseQueryOptionsFor(orpc.payroll.listPeriods, input);

export const usePayrollPeriodList = (): UseSuspenseQueryResult<
	TPayrollOut["listPeriods"]
> => {
	const search = listRouteApi.useSearch();
	return useSuspenseQuery(payrollPeriodListOptions(search));
};

export const usePayrollPeriodListChange = (): TListChange<TPayrollSort> => {
	const navigate = listRouteApi.useNavigate();
	return (patch) => {
		void navigate({ search: (prev) => D.merge(prev, patch) });
	};
};

export const usePayrollPeriodCreate = (): UseMutationResult<
	TPayrollOut["createPeriod"],
	TPayrollErr["createPeriod"],
	TPayrollIn["createPeriod"]
> =>
	useProcedureMutation(orpc.payroll.createPeriod, {
		message: PAYROLL_MESSAGE.NEW_PERIOD,
		invalidates: payrollKeys(),
	});

export const usePayrollCalculate = (): UseMutationResult<
	TPayrollOut["calculate"],
	TPayrollErr["calculate"],
	TPayrollIn["calculate"]
> =>
	useProcedureMutation(orpc.payroll.calculate, {
		message: PAYROLL_MESSAGE.CALCULATE_SUCCESS,
		invalidates: payrollKeys(),
	});

export const payrollPeriodGetOptions = (
	id: string,
): UseSuspenseQueryOptions<TPayrollOut["getPeriod"]> =>
	suspenseQueryOptionsFor(orpc.payroll.getPeriod, { id });

export const usePayrollPeriodGet = (
	id: string,
): UseSuspenseQueryResult<TPayrollOut["getPeriod"]> =>
	useSuspenseQuery(payrollPeriodGetOptions(id));

export const payrollItemListOptions = (
	input: TPayrollIn["listItems"],
): UseSuspenseQueryOptions<TPayrollOut["listItems"]> =>
	suspenseQueryOptionsFor(orpc.payroll.listItems, input);

export const usePayrollItemList = (
	input: TPayrollIn["listItems"],
): UseSuspenseQueryResult<TPayrollOut["listItems"]> =>
	useSuspenseQuery(payrollItemListOptions(input));

export const usePayrollStatusUpdate = (): UseMutationResult<
	TPayrollOut["updateStatus"],
	TPayrollErr["updateStatus"],
	TPayrollIn["updateStatus"]
> =>
	useProcedureMutation(orpc.payroll.updateStatus, {
		message: PAYROLL_MESSAGE.PERIOD_APPROVED,
		invalidates: payrollKeys(),
	});

export const payrollPayslipOptions = (
	id: string,
): UseSuspenseQueryOptions<TPayrollOut["getPayslip"]> =>
	suspenseQueryOptionsFor(orpc.payroll.getPayslip, { id });

export const usePayrollPayslip = (
	id: string,
): UseSuspenseQueryResult<TPayrollOut["getPayslip"]> =>
	useSuspenseQuery(payrollPayslipOptions(id));

export const usePayrollPayslipSend = (): UseMutationResult<
	TPayrollOut["sendPayslip"],
	TPayrollErr["sendPayslip"],
	TPayrollIn["sendPayslip"]
> =>
	useProcedureMutation(orpc.payroll.sendPayslip, {
		message: "Payslip email processed.",
		invalidates: payrollKeys(),
	});

export const payrollReportItemsOptions = (
	periodId: string,
): UseSuspenseQueryOptions<TPayrollOut["reportItems"]> =>
	suspenseQueryOptionsFor(orpc.payroll.reportItems, { id: periodId });

export const usePayrollReportItems = (
	periodId: string,
): UseSuspenseQueryResult<TPayrollOut["reportItems"]> =>
	useSuspenseQuery(payrollReportItemsOptions(periodId));

export const payrollComponentListOptions = (
	periodId: string,
): UseSuspenseQueryOptions<TPayrollOut["listComponents"]> =>
	suspenseQueryOptionsFor(orpc.payroll.listComponents, { periodId });

export const usePayrollComponentList = (
	periodId: string,
): UseSuspenseQueryResult<TPayrollOut["listComponents"]> =>
	useSuspenseQuery(payrollComponentListOptions(periodId));

export const usePayrollComponentCreate = (): UseMutationResult<
	TPayrollOut["createComponent"],
	TPayrollErr["createComponent"],
	TPayrollIn["createComponent"]
> =>
	useProcedureMutation(orpc.payroll.createComponent, {
		message: PAYROLL_MESSAGE.COMPONENT_CREATED,
		invalidates: payrollKeys(),
	});

export const usePayrollComponentDelete = (): UseMutationResult<
	TPayrollOut["deleteComponent"],
	TPayrollErr["deleteComponent"],
	TPayrollIn["deleteComponent"]
> =>
	useProcedureMutation(orpc.payroll.deleteComponent, {
		message: PAYROLL_MESSAGE.COMPONENT_DELETED,
		invalidates: payrollKeys(),
	});

export const usePayrollBankExport = (
	periodId: string,
	enabled: boolean,
): UseQueryResult<TPayrollOut["bankExport"]> =>
	useQuery({
		...orpc.payroll.bankExport.queryOptions({ input: { id: periodId } }),
		queryKey: orpc.payroll.bankExport.key({ input: { id: periodId } }),
		enabled,
	});
