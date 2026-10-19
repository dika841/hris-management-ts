import type { UseMutationResult } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { orpc } from "#/libs/orpc/client.ts";
import { toastError } from "#/libs/orpc/toast-error.ts";
import type {
	TClientErrors,
	TClientInputs,
	TClientOutputs,
} from "#/libs/orpc/types.ts";

type TAiIn = TClientInputs["ai"];
type TAiOut = TClientOutputs["ai"];
type TAiErr = TClientErrors["ai"];

export const useAiAssist = (): UseMutationResult<
	TAiOut["assist"],
	TAiErr["assist"],
	TAiIn["assist"]
> =>
	useMutation(
		orpc.ai.assist.mutationOptions({
			mutationKey: orpc.ai.assist.mutationKey(),
			onError: toastError,
		}),
	);
