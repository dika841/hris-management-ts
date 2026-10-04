import type { Hono } from "hono";
import { z } from "zod";
import { HTTP_STATUS } from "#/platform/http/http-status.ts";
import { env } from "#/platform/config/env.ts";
import { storageEnabledOf } from "#/platform/config/env-schema.ts";
import { runtime } from "#/bootstrap/compose.ts";
import { Effect } from "effect";
import { StorageService } from "#/platform/storage/storage-service.ts";

const UPLOAD_PATH = "/api/upload/presign";
const PRESIGN_EXPIRY_SECONDS = 300; // 5 minutes

const presignRequestSchema = z.object({
	key: z.string().min(1).max(256),
	contentType: z.string().min(1).max(128),
});

/**
 * Mounts a presigned upload URL endpoint at POST /api/upload/presign.
 *
 * Flow:
 *   1. Client calls POST /api/upload/presign with { key, contentType } (must be authenticated).
 *   2. Server generates a 5-minute presigned PUT URL for Cloudflare R2.
 *   3. Client uploads the file directly to R2 — no file bytes pass through the API server.
 *   4. Client stores the `key`; use STORAGE_PUBLIC_URL/<key> to read back the file.
 */
export const uploadMount = (
	app: Hono,
	buildContext: (headers: Headers) => Promise<{ sessionState: string }>,
): void => {
	if (!storageEnabledOf(env)) {
		app.post(UPLOAD_PATH, (ctx) =>
			ctx.json({ error: "File upload is not configured on this server." }, 503),
		);
		return;
	}

	app.post(UPLOAD_PATH, async (ctx) => {
		// Auth guard
		const context = await buildContext(new Headers(ctx.req.header()));
		if (context.sessionState !== "resolved") {
			return ctx.json({ error: "Unauthorized" }, 401);
		}

		// Parse and validate body
		let body: unknown;
		try {
			body = await ctx.req.json();
		} catch {
			return ctx.json({ error: "Invalid JSON body" }, 400);
		}

		const parsed = presignRequestSchema.safeParse(body);
		if (!parsed.success) {
			return ctx.json(
				{ error: "Invalid request", details: parsed.error.flatten() },
				400,
			);
		}

		const { key } = parsed.data;

		// Sanitise key: prevent path traversal
		const safeKey = key.replace(/\.\./g, "").replace(/^\/+/, "");
		if (!safeKey) {
			return ctx.json({ error: "Invalid key" }, 400);
		}

		// Get the storage instance from the runtime
		let presignUrl: string;
		try {
			presignUrl = await runtime.runPromise(
				StorageService.use((service) => {
					const storage = service.storage;
					if (!storage) {
						return Effect.die(new Error("Storage not configured"));
					}
					return Effect.promise(() =>
						storage.getUrl(safeKey, PRESIGN_EXPIRY_SECONDS),
					);
				}),
			);
		} catch (cause) {
			return ctx.json(
				{ error: `Failed to generate presigned URL: ${String(cause)}` },
				HTTP_STATUS.INTERNAL_SERVER_ERROR,
			);
		}

		const publicUrl = env.STORAGE_PUBLIC_URL
			? `${env.STORAGE_PUBLIC_URL}/${safeKey}`
			: null;

		return ctx.json({ presignUrl, key: safeKey, publicUrl });
	});
};
