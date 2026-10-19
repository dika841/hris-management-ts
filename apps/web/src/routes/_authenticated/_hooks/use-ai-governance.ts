import { AI_GOVERNANCE_MESSAGE } from "@app/messages";
import {
	type UseMutationResult,
	type UseQueryResult,
	useQuery,
} from "@tanstack/react-query";
import { orpc } from "#/libs/orpc/client.ts";
import { useProcedureMutation } from "#/libs/orpc/procedure-mutation.ts";
import type {
	TClientErrors,
	TClientInputs,
	TClientOutputs,
} from "#/libs/orpc/types.ts";

type TAiIn = TClientInputs["aiGovernance"];
type TAiOut = TClientOutputs["aiGovernance"];
type TAiErr = TClientErrors["aiGovernance"];

export const aiDecisionKeys = (): readonly (readonly unknown[])[] => [
	orpc.aiGovernance.key(),
];

export const useAiDecisionList = (
	input: TAiIn["list"],
): UseQueryResult<TAiOut["list"], TAiErr["list"]> =>
	useQuery({
		...orpc.aiGovernance.list.queryOptions({ input }),
		queryKey: orpc.aiGovernance.list.key({ input }),
	});

export const useAiDecisionCreate = (): UseMutationResult<
	TAiOut["create"],
	TAiErr["create"],
	TAiIn["create"]
> =>
	useProcedureMutation(orpc.aiGovernance.create, {
		message: AI_GOVERNANCE_MESSAGE.CREATED_TOAST,
		invalidates: aiDecisionKeys(),
	});

export const useAiDecisionApprove = (): UseMutationResult<
	TAiOut["approve"],
	TAiErr["approve"],
	TAiIn["approve"]
> =>
	useProcedureMutation(orpc.aiGovernance.approve, {
		message: AI_GOVERNANCE_MESSAGE.APPROVED_TOAST,
		invalidates: aiDecisionKeys(),
	});

export const useAiDecisionReject = (): UseMutationResult<
	TAiOut["reject"],
	TAiErr["reject"],
	TAiIn["reject"]
> =>
	useProcedureMutation(orpc.aiGovernance.reject, {
		message: AI_GOVERNANCE_MESSAGE.REJECTED_TOAST,
		invalidates: aiDecisionKeys(),
	});
