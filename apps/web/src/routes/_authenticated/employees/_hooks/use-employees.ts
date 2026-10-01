import { EMPLOYEE_MESSAGE } from "@app/messages";
import type { TEmployeeListInput, TEmployeeSort } from "@app/schemas";
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

type TEmployeeIn = TClientInputs["employee"];
type TEmployeeOut = TClientOutputs["employee"];
type TEmployeeErr = TClientErrors["employee"];

const listRouteApi = getRouteApi("/_authenticated/employees/");

export const employeeKeys = (): readonly (readonly unknown[])[] => [
	orpc.employee.key(),
];

export const employeeListOptions = (
	input: TEmployeeListInput,
): UseSuspenseQueryOptions<TEmployeeOut["list"]> =>
	suspenseQueryOptionsFor(orpc.employee.list, input);

export const useEmployeeList = (): UseSuspenseQueryResult<
	TEmployeeOut["list"]
> => {
	const search = listRouteApi.useSearch();
	return useSuspenseQuery(employeeListOptions(search));
};

export const useEmployeeListChange = (): TListChange<TEmployeeSort> => {
	const navigate = listRouteApi.useNavigate();
	return (patch) => {
		void navigate({ search: (prev) => D.merge(prev, patch) });
	};
};

export const employeeGetOptions = (
	id: string,
): UseSuspenseQueryOptions<TEmployeeOut["get"]> =>
	suspenseQueryOptionsFor(orpc.employee.get, { id });

export const useEmployeeGet = (
	id: string,
): UseSuspenseQueryResult<TEmployeeOut["get"]> =>
	useSuspenseQuery(employeeGetOptions(id));

export const useEmployeeCreate = (): UseMutationResult<
	TEmployeeOut["create"],
	TEmployeeErr["create"],
	TEmployeeIn["create"]
> =>
	useProcedureMutation(orpc.employee.create, {
		message: EMPLOYEE_MESSAGE.CREATED,
		invalidates: employeeKeys(),
	});

export const useEmployeeUpdate = (): UseMutationResult<
	TEmployeeOut["update"],
	TEmployeeErr["update"],
	TEmployeeIn["update"]
> =>
	useProcedureMutation(orpc.employee.update, {
		message: EMPLOYEE_MESSAGE.UPDATED,
		invalidates: employeeKeys(),
	});

export const useEmployeeDelete = (): UseMutationResult<
	TEmployeeOut["remove"],
	TEmployeeErr["remove"],
	TEmployeeIn["remove"]
> =>
	useProcedureMutation(orpc.employee.remove, {
		message: EMPLOYEE_MESSAGE.DELETED,
		invalidates: employeeKeys(),
	});

// Contracts
export const contractListOptions = (
	employeeId: string,
): UseSuspenseQueryOptions<TEmployeeOut["contractList"]> =>
	suspenseQueryOptionsFor(orpc.employee.contractList, { employeeId });

export const useContractList = (
	employeeId: string,
): UseSuspenseQueryResult<TEmployeeOut["contractList"]> =>
	useSuspenseQuery(contractListOptions(employeeId));

export const useContractCreate = (): UseMutationResult<
	TEmployeeOut["contractCreate"],
	TEmployeeErr["contractCreate"],
	TEmployeeIn["contractCreate"]
> =>
	useProcedureMutation(orpc.employee.contractCreate, {
		message: EMPLOYEE_MESSAGE.CONTRACT_CREATED,
		invalidates: employeeKeys(),
	});

export const useContractRenew = (): UseMutationResult<
	TEmployeeOut["contractRenew"],
	TEmployeeErr["contractRenew"],
	TEmployeeIn["contractRenew"]
> =>
	useProcedureMutation(orpc.employee.contractRenew, {
		message: EMPLOYEE_MESSAGE.CONTRACT_RENEWED,
		invalidates: employeeKeys(),
	});

export const useContractConvert = (): UseMutationResult<
	TEmployeeOut["contractConvert"],
	TEmployeeErr["contractConvert"],
	TEmployeeIn["contractConvert"]
> =>
	useProcedureMutation(orpc.employee.contractConvert, {
		message: EMPLOYEE_MESSAGE.CONTRACT_CONVERTED,
		invalidates: employeeKeys(),
	});

export const useContractCompensationPay = (): UseMutationResult<
	TEmployeeOut["contractCompensationPay"],
	TEmployeeErr["contractCompensationPay"],
	TEmployeeIn["contractCompensationPay"]
> =>
	useProcedureMutation(orpc.employee.contractCompensationPay, {
		message: EMPLOYEE_MESSAGE.COMPENSATION_PAID,
		invalidates: employeeKeys(),
	});

export const expiringContractsOptions = (
	days = 30,
): UseSuspenseQueryOptions<TEmployeeOut["expiringContracts"]> =>
	suspenseQueryOptionsFor(orpc.employee.expiringContracts, { days });

export const useExpiringContracts = (
	days = 30,
): UseSuspenseQueryResult<TEmployeeOut["expiringContracts"]> =>
	useSuspenseQuery(expiringContractsOptions(days));

// Departments & Positions
export const departmentListOptions = (): UseSuspenseQueryOptions<
	TEmployeeOut["departmentList"]
> => suspenseQueryOptionsFor(orpc.employee.departmentList, undefined);

export const useDepartmentList = (): UseSuspenseQueryResult<
	TEmployeeOut["departmentList"]
> => useSuspenseQuery(departmentListOptions());

export const positionListOptions = (): UseSuspenseQueryOptions<
	TEmployeeOut["positionList"]
> => suspenseQueryOptionsFor(orpc.employee.positionList, undefined);

export const usePositionList = (): UseSuspenseQueryResult<
	TEmployeeOut["positionList"]
> => useSuspenseQuery(positionListOptions());
