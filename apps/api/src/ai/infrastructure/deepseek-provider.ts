import { Layer } from "effect";
import { AiProvider } from "#/ai/domain/ai-provider.ts";
import { deepseekComplete } from "#/ai/infrastructure/deepseek-client.ts";

export const aiProviderLayer = Layer.succeed(AiProvider, {
	complete: deepseekComplete,
});
