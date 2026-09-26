import { fileURLToPath } from "node:url";
import { match } from "ts-pattern";
import { afterEach, describe, expect, it } from "vitest";
import {
	GRPC_CALL_ERROR,
	GRPC_LOAD_ERROR,
	type TGrpcClient,
	type TGrpcServer,
	grpcClientCreate,
	grpcServerCreate,
} from "./index.ts";

const PROTO_PATH = fileURLToPath(new URL("./note.proto", import.meta.url));
const PACKAGE = "note";
const SERVICE = "NoteService";

type TNote = { id: string; title: string; content: string };

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null;

const isNote = (value: unknown): value is TNote =>
	isRecord(value) &&
	typeof value.id === "string" &&
	typeof value.title === "string" &&
	typeof value.content === "string";

const noteDecode = (value: unknown): TNote =>
	match(value)
		.when(isNote, (note): TNote => note)
		.otherwise((): never => {
			throw new Error("not a note");
		});

const stringField = (value: unknown, field: string): string =>
	isRecord(value) && typeof value[field] === "string" ? value[field] : "";

const idOf = (value: unknown): string => stringField(value, "id");

const draftOf = (value: unknown): Pick<TNote, "title" | "content"> => ({
	title: stringField(value, "title"),
	content: stringField(value, "content"),
});

const noteOf = (value: unknown): TNote => ({
	id: idOf(value),
	...draftOf(value),
});

describe("grpcServerCreate + grpcClientCreate", () => {
	let server: TGrpcServer | undefined;
	let client: TGrpcClient | undefined;

	afterEach(async () => {
		client?.close();
		await server?.close();
		server = undefined;
		client = undefined;
	});

	it("round-trips a unary call through a real server and client", async () => {
		const notes: Record<string, TNote> = {
			"note-1": { id: "note-1", title: "First note", content: "Hello" },
		};

		server = await grpcServerCreate({
			protoPath: PROTO_PATH,
			packageName: PACKAGE,
			serviceName: SERVICE,
			handlers: {
				getNote: async (request: unknown) => notes[idOf(request)],
				createNote: async (request: unknown) => {
					const created: TNote = { id: "note-2", ...draftOf(request) };
					notes[created.id] = created;
					return created;
				},
			},
		});

		client = await grpcClientCreate({
			protoPath: PROTO_PATH,
			packageName: PACKAGE,
			serviceName: SERVICE,
			address: `127.0.0.1:${server.port}`,
		});

		const fetched = await client.call("getNote", { id: "note-1" }, noteDecode);
		expect(fetched.title).toBe("First note");

		const created = await client.call(
			"createNote",
			{ title: "Second note", content: "World" },
			noteDecode,
		);
		expect(created.id).toBe("note-2");
		expect(created.content).toBe("World");
	});

	it("rejects when the server handler throws", async () => {
		server = await grpcServerCreate({
			protoPath: PROTO_PATH,
			packageName: PACKAGE,
			serviceName: SERVICE,
			handlers: {
				getNote: async () => {
					throw new Error("not found");
				},
				createNote: async (request: unknown) => noteOf(request),
			},
		});

		client = await grpcClientCreate({
			protoPath: PROTO_PATH,
			packageName: PACKAGE,
			serviceName: SERVICE,
			address: `127.0.0.1:${server.port}`,
		});

		await expect(
			client.call("getNote", { id: "missing" }, noteDecode),
		).rejects.toMatchObject({ details: "not found" });
	});

	it("rejects a method the service does not define instead of exploding", async () => {
		server = await grpcServerCreate({
			protoPath: PROTO_PATH,
			packageName: PACKAGE,
			serviceName: SERVICE,
			handlers: {
				getNote: async (request: unknown) => noteOf(request),
				createNote: async (request: unknown) => noteOf(request),
			},
		});
		client = await grpcClientCreate({
			protoPath: PROTO_PATH,
			packageName: PACKAGE,
			serviceName: SERVICE,
			address: `127.0.0.1:${server.port}`,
		});

		await expect(
			client.call("deleteNote", { id: "note-1" }, noteDecode),
		).rejects.toThrow(GRPC_CALL_ERROR.METHOD_MISSING);
	});

	it("names a service that the proto does not define", async () => {
		await expect(
			grpcServerCreate({
				protoPath: PROTO_PATH,
				packageName: PACKAGE,
				serviceName: "TagService",
				handlers: {},
			}),
		).rejects.toThrow(GRPC_LOAD_ERROR.SERVICE_MISSING);
	});
});
