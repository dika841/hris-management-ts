import {
	storageCreate,
	STORAGE_CONTENT_TYPE,
	type TStorage,
} from "@app/storage";
import { Context, Effect, Layer } from "effect";
import { env } from "#/platform/config/env.ts";
import { storageEnabledOf } from "#/platform/config/env-schema.ts";
import type { TServiceId } from "#/shared/service-id.ts";
import { SERVICE_TAG } from "#/platform/service-tags.ts";
import { logger } from "#/platform/observability/logger.ts";

export type TStorageService = {
	readonly storage: TStorage | null;
	readonly enabled: boolean;
};

export type TStorageServiceId = TServiceId<typeof SERVICE_TAG.STORAGE>;

export const StorageService = Context.Service<
	TStorageServiceId,
	TStorageService
>(SERVICE_TAG.STORAGE);

export const storageServiceLayer = Layer.effect(
	StorageService,
	Effect.gen(function* () {
		const isEnabled = storageEnabledOf(env);

		if (!isEnabled) {
			logger.warn(
				"STORAGE_* env vars not set — file upload features are disabled",
			);
			return StorageService.of({ storage: null, enabled: false });
		}

		// All storage vars are guaranteed non-null here since storageEnabledOf returned true
		// biome-ignore lint/style/noNonNullAssertion: guarded by storageEnabledOf
		const storage = storageCreate({
			accessKeyId: env.STORAGE_ACCESS_KEY_ID!,
			secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY!,
			bucket: env.STORAGE_BUCKET!,
			endpoint: env.STORAGE_ENDPOINT!,
			maxBytes: env.STORAGE_MAX_BYTES,
			allowedContentTypes: [
				STORAGE_CONTENT_TYPE.JPEG,
				STORAGE_CONTENT_TYPE.PNG,
				STORAGE_CONTENT_TYPE.WEBP,
				STORAGE_CONTENT_TYPE.PDF,
			],
		});

		logger.info(
			{ bucket: env.STORAGE_BUCKET, endpoint: env.STORAGE_ENDPOINT },
			"storage.connected",
		);

		return StorageService.of({ storage, enabled: true });
	}),
);
