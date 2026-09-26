import { PAYROLL_MESSAGE } from "@app/messages";
import type { TPayrollPeriodListInput, TPayrollSort } from "@app/schemas";
import { D } from "@mobily/ts-belt";
import {
	type UseMutationResult,
	type UseSuspenseQueryOptions,
	type UseSuspenseQueryResult,
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
