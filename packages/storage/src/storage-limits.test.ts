import { STORAGE_MESSAGE } from "@app/messages";
import { describe, expect, it } from "vitest";
import {
	STORAGE_CONTENT_TYPE,
	STORAGE_MEGABYTE,
	STORAGE_REJECTION,
	type TStorageLimits,
	isStorageRejection,
	storageByteLength,
	storageContentTypeNormalise,
	storagePutRejection,
	storageReadRejection,
} from "./storage-limits.ts";

const limits: TStorageLimits = {
	maxBytes: STORAGE_MEGABYTE,
	allowedContentTypes: [STORAGE_CONTENT_TYPE.PDF, STORAGE_CONTENT_TYPE.PNG],
};

describe("storageByteLength", () => {
	it("counts encoded bytes rather than characters", (): void => {
		expect(storageByteLength("héllo")).toBe(6);
	});

	it("reads the length of a byte array", (): void => {
		expect(storageByteLength(new Uint8Array(42))).toBe(42);
	});
});

describe("storageContentTypeNormalise", () => {
	it("drops parameters and lowercases", (): void => {
		expect(storageContentTypeNormalise("TEXT/CSV; charset=utf-8")).toBe(
			"text/csv",
		);
	});
});

describe("storagePutRejection", () => {
	it("accepts a file within both limits", (): void => {
		expect(
			storagePutRejection(limits, "a.pdf", "body", STORAGE_CONTENT_TYPE.PDF),
		).toBeNull();
	});

	it("accepts a declared type that carries a charset", (): void => {
		expect(
			storagePutRejection(limits, "a.pdf", "body", "application/pdf; v=1"),
		).toBeNull();
	});

	it("rejects a missing content type with an explicit reason", (): void => {
		const rejection = storagePutRejection(limits, "a.pdf", "body", "");

		expect(rejection?.rejection).toBe(STORAGE_REJECTION.CONTENT_TYPE_MISSING);
		expect(rejection?.message).toBe(STORAGE_MESSAGE.CONTENT_TYPE_MISSING);
	});

	it("does not measure a body it has already refused on type", (): void => {
		const rejection = storagePutRejection(limits, "a.csv", "body", "");

		expect(rejection?.byteLength).toBeUndefined();
	});

	it("rejects a type outside the allowlist", (): void => {
		const rejection = storagePutRejection(
			limits,
			"a.csv",
			"body",
			STORAGE_CONTENT_TYPE.CSV,
		);

		expect(rejection?.rejection).toBe(
			STORAGE_REJECTION.CONTENT_TYPE_NOT_ALLOWED,
		);
		expect(rejection?.contentType).toBe(STORAGE_CONTENT_TYPE.CSV);
	});

	it("rejects a body over the size limit and reports both numbers", (): void => {
		const rejection = storagePutRejection(
			limits,
			"big.pdf",
			new Uint8Array(STORAGE_MEGABYTE + 1),
			STORAGE_CONTENT_TYPE.PDF,
		);

		expect(rejection?.rejection).toBe(STORAGE_REJECTION.TOO_LARGE);
		expect(rejection?.byteLength).toBe(STORAGE_MEGABYTE + 1);
		expect(rejection?.limitBytes).toBe(STORAGE_MEGABYTE);
	});

	it("reports the type before the size when both are wrong", (): void => {
		const rejection = storagePutRejection(
			limits,
			"big.csv",
			new Uint8Array(STORAGE_MEGABYTE + 1),
			STORAGE_CONTENT_TYPE.CSV,
		);

		expect(rejection?.rejection).toBe(
			STORAGE_REJECTION.CONTENT_TYPE_NOT_ALLOWED,
		);
	});
});

describe("storageReadRejection", () => {
	it("accepts an object within the limit", (): void => {
		expect(storageReadRejection(limits, "a.pdf", STORAGE_MEGABYTE)).toBeNull();
	});

	it("rejects an object over the limit", (): void => {
		expect(
			storageReadRejection(limits, "a.pdf", STORAGE_MEGABYTE + 1)?.rejection,
		).toBe(STORAGE_REJECTION.TOO_LARGE);
	});
});

describe("isStorageRejection", () => {
	it("recognises a rejection", (): void => {
		expect(
			isStorageRejection(storagePutRejection(limits, "a.pdf", "body", "")),
		).toBe(true);
	});

	it("does not claim an ordinary failure", (): void => {
		expect(isStorageRejection(new Error("network down"))).toBe(false);
	});
});
