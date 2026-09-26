import { STORAGE_MESSAGE } from "@app/messages";
import { A } from "@mobily/ts-belt";
import { match, P } from "ts-pattern";

export const STORAGE_MEGABYTE = 1_024 * 1_024;

export const STORAGE_CONTENT_TYPE = {
	PDF: "application/pdf",
	PNG: "image/png",
	JPEG: "image/jpeg",
	WEBP: "image/webp",
	CSV: "text/csv",
	PLAIN_TEXT: "text/plain",
} as const;

export type TStorageContentType =
	(typeof STORAGE_CONTENT_TYPE)[keyof typeof STORAGE_CONTENT_TYPE];

export const STORAGE_REJECTION = {
	TOO_LARGE: "too-large",
	CONTENT_TYPE_MISSING: "content-type-missing",
	CONTENT_TYPE_NOT_ALLOWED: "content-type-not-allowed",
} as const;

export type TStorageRejection =
	(typeof STORAGE_REJECTION)[keyof typeof STORAGE_REJECTION];

export type TStorageRejectionError = Error & {
	rejection: TStorageRejection;
	key: string;
	limitBytes: number;
	byteLength?: number;
	contentType?: string;
};

const REJECTION_MESSAGE = {
	[STORAGE_REJECTION.TOO_LARGE]: STORAGE_MESSAGE.TOO_LARGE,
	[STORAGE_REJECTION.CONTENT_TYPE_MISSING]:
		STORAGE_MESSAGE.CONTENT_TYPE_MISSING,
	[STORAGE_REJECTION.CONTENT_TYPE_NOT_ALLOWED]:
		STORAGE_MESSAGE.CONTENT_TYPE_NOT_ALLOWED,
} as const;

export const storageRejection = (
	rejection: TStorageRejection,
	detail: Omit<TStorageRejectionError, keyof Error | "rejection">,
): TStorageRejectionError =>
	Object.assign(new Error(REJECTION_MESSAGE[rejection]), {
		rejection,
		...detail,
	});

export const isStorageRejection = (
	error: unknown,
): error is TStorageRejectionError =>
	error instanceof Error &&
	"rejection" in error &&
	A.includes(
		Object.values(STORAGE_REJECTION),
		(error as TStorageRejectionError).rejection,
	);

export const storageByteLength = (body: Uint8Array | string): number =>
	match(body)
		.with(P.string, (text): number => new TextEncoder().encode(text).byteLength)
		.otherwise((bytes): number => bytes.byteLength);

export const storageContentTypeNormalise = (contentType: string): string =>
	(contentType.split(";")[0] ?? "").trim().toLowerCase();

export type TStorageLimits = {
	maxBytes: number;
	allowedContentTypes: readonly TStorageContentType[];
};

export const storagePutRejection = (
	limits: TStorageLimits,
	key: string,
	body: Uint8Array | string,
	contentType: string,
): TStorageRejectionError | null => {
	const normalised = storageContentTypeNormalise(contentType);

	const allowed = A.some(
		limits.allowedContentTypes,
		(candidate): boolean => candidate === normalised,
	);

	return match({ normalised, allowed })
		.with(
			{ normalised: "" },
			(): TStorageRejectionError =>
				storageRejection(STORAGE_REJECTION.CONTENT_TYPE_MISSING, {
					key,
					limitBytes: limits.maxBytes,
				}),
		)
		.with(
			{ allowed: false },
			(): TStorageRejectionError =>
				storageRejection(STORAGE_REJECTION.CONTENT_TYPE_NOT_ALLOWED, {
					key,
					limitBytes: limits.maxBytes,
					contentType: normalised,
				}),
		)
		.otherwise((): TStorageRejectionError | null => {
			const byteLength = storageByteLength(body);

			return match(byteLength > limits.maxBytes)
				.with(
					true,
					(): TStorageRejectionError =>
						storageRejection(STORAGE_REJECTION.TOO_LARGE, {
							key,
							limitBytes: limits.maxBytes,
							byteLength,
							contentType: normalised,
						}),
				)
				.otherwise((): TStorageRejectionError | null => null);
		});
};

export const storageReadRejection = (
	limits: TStorageLimits,
	key: string,
	byteLength: number,
): TStorageRejectionError | null =>
	match(byteLength)
		.with(
			P.when((length): boolean => length > limits.maxBytes),
			(length): TStorageRejectionError =>
				storageRejection(STORAGE_REJECTION.TOO_LARGE, {
					key,
					limitBytes: limits.maxBytes,
					byteLength: length,
				}),
		)
		.otherwise((): TStorageRejectionError | null => null);
