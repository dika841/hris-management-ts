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

export const useEmployeeCreate = (): UseMutationResult<
	TEmployeeOut["create"],
	TEmployeeErr["create"],
	TEmployeeIn["create"]
> =>
	useProcedureMutation(orpc.employee.create, {
		message: EMPLOYEE_MESSAGE.CREATED,
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
