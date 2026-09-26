import http, { type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { match, P } from "ts-pattern";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
	STORAGE_CONTENT_TYPE,
	STORAGE_MEGABYTE,
	STORAGE_REJECTION,
	isStorageRejection,
} from "./storage-limits.ts";
import { type TStorageOptions, storageCreate } from "./storage.ts";

const LARGE_CHUNKED_KEY = "large-chunked";
const LARGE_DECLARED_KEY = "large-declared";
const ENDLESS_KEY = "endless";
const MISSING_KEY = "missing";

const OVER_LIMIT = STORAGE_MEGABYTE + 1;
const CHUNK = "x".repeat(64 * 1024);

const credentials = {
	accessKeyId: "test-access-key",
	secretAccessKey: "test-secret-key",
	bucket: "test-bucket",
	maxBytes: STORAGE_MEGABYTE,
	allowedContentTypes: [STORAGE_CONTENT_TYPE.PDF, STORAGE_CONTENT_TYPE.PNG],
} as const;

describe("storageCreate.getUrl", () => {
	it("signs a presigned GET url with the requested expiry", async (): Promise<void> => {
		const storage = storageCreate({
			...credentials,
			endpoint: "https://storage.example.com",
		});

		const url = await storage.getUrl("files/welcome.txt", 120);

		expect(url).toContain("test-bucket/files/welcome.txt");
		expect(url).toContain("X-Amz-Expires=120");
		expect(url).toContain("X-Amz-Signature=");
	});
});

describe("storageCreate against a local server", () => {
	let server: Server;
	let endpoint: string;
	let requests: string[] = [];

	const options = (): TStorageOptions => ({ ...credentials, endpoint });

	beforeAll(async (): Promise<void> => {
		server = http.createServer((req, res): void => {
			requests.push(req.url ?? "");
			match(req.url)
				.with(P.string.includes(MISSING_KEY), (): void => {
					res.writeHead(404).end();
				})
				.with(P.string.includes(LARGE_DECLARED_KEY), (): void => {
					res
						.writeHead(200, { "content-length": String(OVER_LIMIT) })
						.end("x".repeat(OVER_LIMIT));
				})
				.with(P.string.includes(LARGE_CHUNKED_KEY), (): void => {
					res.writeHead(200).end("x".repeat(OVER_LIMIT));
				})
				.with(P.string.includes(ENDLESS_KEY), (): void => {
					res.writeHead(200);
					const timer = setInterval((): void => {
						res.write(CHUNK);
					}, 1);
					res.on("close", (): void => clearInterval(timer));
				})
				.otherwise((): void => {
					res.writeHead(200).end("hello");
				});
		});
		await new Promise<void>((resolve) => {
			server.listen(0, resolve);
		});
		const address = server.address() as AddressInfo;
		endpoint = `http://127.0.0.1:${address.port}`;
	});

	beforeEach((): void => {
		requests = [];
	});

	afterAll(async (): Promise<void> => {
		await new Promise<void>((resolve) => {
			server.close(() => resolve());
		});
	});

	it("returns null for a 404", async (): Promise<void> => {
		expect(await storageCreate(options()).get(MISSING_KEY)).toBeNull();
	});

	it("returns the object bytes for a 200", async (): Promise<void> => {
		const result = await storageCreate(options()).get("present-key");

		expect(new TextDecoder().decode(result ?? new Uint8Array())).toBe("hello");
	});

	it("stores a file that is within both limits", async (): Promise<void> => {
		await storageCreate(options()).put(
			"ok.pdf",
			"hello",
			STORAGE_CONTENT_TYPE.PDF,
		);

		expect(requests).toHaveLength(1);
	});

	it("refuses an oversized upload without contacting the bucket", async (): Promise<void> => {
		const put = storageCreate(options()).put(
			"big.pdf",
			new Uint8Array(STORAGE_MEGABYTE + 1),
			STORAGE_CONTENT_TYPE.PDF,
		);

		await expect(put).rejects.toSatisfy(
			(error: unknown): boolean =>
				isStorageRejection(error) &&
				error.rejection === STORAGE_REJECTION.TOO_LARGE,
		);
		expect(requests).toHaveLength(0);
	});

	it("refuses a content type outside the allowlist", async (): Promise<void> => {
		const put = storageCreate(options()).put(
			"sheet.csv",
			"a,b",
			STORAGE_CONTENT_TYPE.CSV,
		);

		await expect(put).rejects.toSatisfy(
			(error: unknown): boolean =>
				isStorageRejection(error) &&
				error.rejection === STORAGE_REJECTION.CONTENT_TYPE_NOT_ALLOWED,
		);
		expect(requests).toHaveLength(0);
	});

	it("refuses an oversized object on its declared length, before reading a byte", async (): Promise<void> => {
		const get = storageCreate(options()).get(LARGE_DECLARED_KEY);

		await expect(get).rejects.toSatisfy(
			(error: unknown): boolean =>
				isStorageRejection(error) &&
				error.rejection === STORAGE_REJECTION.TOO_LARGE &&
				error.byteLength === OVER_LIMIT,
		);
	});

	it("refuses an oversized object that arrives chunked, with no declared length", async (): Promise<void> => {
		const get = storageCreate(options()).get(LARGE_CHUNKED_KEY);

		await expect(get).rejects.toSatisfy(
			(error: unknown): boolean =>
				isStorageRejection(error) &&
				error.rejection === STORAGE_REJECTION.TOO_LARGE,
		);
	});

	it("stops reading a stream that never ends rather than buffering it", async (): Promise<void> => {
		const get = storageCreate(options()).get(ENDLESS_KEY);

		await expect(get).rejects.toSatisfy(
			(error: unknown): boolean =>
				isStorageRejection(error) &&
				error.rejection === STORAGE_REJECTION.TOO_LARGE,
		);
	});
});
