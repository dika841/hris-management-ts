import * as grpc from "@grpc/grpc-js";
import { match, P } from "ts-pattern";
import { getServiceConstructor } from "./proto.ts";

const DEFAULT_HOST = "127.0.0.1";
const EPHEMERAL_PORT = 0;
const HANDLER_FAILURE_NAME = "EGrpcHandler";

export type TGrpcHandler<TRequest = unknown, TResponse = unknown> = (
	request: TRequest,
) => Promise<TResponse>;

export type TGrpcServerOptions = {
	protoPath: string;
	packageName: string;
	serviceName: string;
	handlers: Record<string, TGrpcHandler>;
	host?: string;
};

export type TGrpcServer = {
	port: number;
	close: () => Promise<void>;
};

const messageOf = (cause: unknown): string =>
	match(cause)
		.with(P.instanceOf(Error), (error): string => error.message)
		.otherwise((found): string => String(found));

export class EGrpcHandler extends Error implements grpc.ServiceError {
	readonly code = grpc.status.INTERNAL;
	readonly details: string;
	readonly metadata = new grpc.Metadata();

	constructor(cause: unknown) {
		super(messageOf(cause), { cause });
		this.name = HANDLER_FAILURE_NAME;
		this.details = messageOf(cause);
	}
}

const wrapHandler = (
	handler: TGrpcHandler,
): grpc.handleUnaryCall<unknown, unknown> => {
	return (call, callback) => {
		handler(call.request)
			.then((response) => callback(null, response))
			.catch((cause: unknown) => callback(new EGrpcHandler(cause), null));
	};
};

export const grpcServerCreate = async (
	options: TGrpcServerOptions,
): Promise<TGrpcServer> => {
	const serviceCtor = await getServiceConstructor(
		options.protoPath,
		options.packageName,
		options.serviceName,
	);

	const implementation: grpc.UntypedServiceImplementation = Object.fromEntries(
		Object.entries(options.handlers).map(([method, handler]) => [
			method,
			wrapHandler(handler),
		]),
	);

	const server = new grpc.Server();
	server.addService(serviceCtor.service, implementation);

	const address = `${options.host ?? DEFAULT_HOST}:${EPHEMERAL_PORT}`;

	const port = await new Promise<number>((resolve, reject) => {
		server.bindAsync(
			address,
			grpc.ServerCredentials.createInsecure(),
			(error, boundPort) => {
				match(error)
					.with(P.nullish, () => resolve(boundPort))
					.otherwise((bindError) => reject(bindError));
			},
		);
	});

	const close = (): Promise<void> =>
		new Promise((resolve) => {
			server.tryShutdown(() => resolve());
		});

	return { port, close };
};
