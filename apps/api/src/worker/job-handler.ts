import type { TJobHandler } from "@app/queue";
import { logger } from "#/platform/observability/logger.ts";

export type TExampleJobPayload = {
	noteId: string;
};

export const exampleJobProcess: TJobHandler<TExampleJobPayload> = async (
	payload,
): Promise<void> => {
	logger.info({ noteId: payload.noteId }, "processing job");
};
