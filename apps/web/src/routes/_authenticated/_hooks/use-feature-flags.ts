import { FEATURE_FLAG_MESSAGE } from "@app/messages";
import {
	type UseMutationResult,
	type UseQueryResult,
	type UseSuspenseQueryOptions,
	type UseSuspenseQueryResult,
	useQuery,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { orpc } from "#/libs/orpc/client.ts";
import { useProcedureMutation } from "#/libs/orpc/procedure-mutation.ts";
import { suspenseQueryOptionsFor } from "#/libs/orpc/procedure-query.ts";
import type {
	TClientErrors,
	TClientInputs,
	TClientOutputs,
} from "#/libs/orpc/types.ts";

type TFlagIn = TClientInputs["featureFlags"];
type TFlagOut = TClientOutputs["featureFlags"];
type TFlagErr = TClientErrors["featureFlags"];

const flagKeys = (): readonly (readonly unknown[])[] => [
	orpc.featureFlags.key(),
	orpc.featureFlags.evaluate.key(),
];

export const featureFlagListOptions = (): UseSuspenseQueryOptions<
	TFlagOut["list"],
	TFlagErr["list"]
> => suspenseQueryOptionsFor(orpc.featureFlags.list, undefined);

export const useFeatureFlagList = (): UseSuspenseQueryResult<
	TFlagOut["list"],
	TFlagErr["list"]
> => useSuspenseQuery(featureFlagListOptions());

export const useFeatureFlagEvaluation = (): UseQueryResult<
	TFlagOut["evaluate"],
	TFlagErr["evaluate"]
> =>
	useQuery({
		...orpc.featureFlags.evaluate.queryOptions({
			queryKey: orpc.featureFlags.evaluate.key(),
		}),
		queryKey: orpc.featureFlags.evaluate.key(),
	});

export const useFeatureFlag = (key: string): boolean => {
	const evaluation = useFeatureFlagEvaluation();
	return evaluation.data?.find((flag) => flag.key === key)?.enabled ?? false;
};

export const useFeatureFlagCreate = (): UseMutationResult<
	TFlagOut["create"],
	TFlagErr["create"],
	TFlagIn["create"]
> =>
	useProcedureMutation(orpc.featureFlags.create, {
		message: FEATURE_FLAG_MESSAGE.CREATED,
		invalidates: flagKeys(),
	});

export const useFeatureFlagUpdate = (): UseMutationResult<
	TFlagOut["update"],
	TFlagErr["update"],
	TFlagIn["update"]
> =>
	useProcedureMutation(orpc.featureFlags.update, {
		message: FEATURE_FLAG_MESSAGE.UPDATED,
		invalidates: flagKeys(),
	});

export const useFeatureFlagDelete = (): UseMutationResult<
	TFlagOut["remove"],
	TFlagErr["remove"],
	TFlagIn["remove"]
> =>
	useProcedureMutation(orpc.featureFlags.remove, {
		message: FEATURE_FLAG_MESSAGE.DELETED,
		invalidates: flagKeys(),
	});
