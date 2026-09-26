import * as grpc from "@grpc/grpc-js";
import { match, P } from "ts-pattern";
import { getServiceConstructor } from "./proto.ts";

export const GRPC_CALL_ERROR = {
	METHOD_MISSING: "gRPC method not found on the service client",
} as const;

export type TGrpcClientOptions = {
	protoPath: string;
	packageName: string;
	serviceName: string;
	address: string;
};

export type TResponseDecoder<TResponse> = (value: unknown) => TResponse;

export type TGrpcClient = {
	call: <TRequest, TResponse>(
		method: string,
		request: TRequest,
		decode: TResponseDecoder<TResponse>,
	) => Promise<TResponse>;
	close: () => void;
};

type TServiceClient = InstanceType<grpc.ServiceClientConstructor>;

type TUnaryMethod = (
	this: TServiceClient,
	request: unknown,
	callback: grpc.requestCallback<unknown>,
) => grpc.ClientUnaryCall;

const isUnaryMethod = (value: unknown): value is TUnaryMethod =>
	typeof value === "function";

const unaryMethodOf = (client: TServiceClient, method: string): TUnaryMethod =>
	match(client[method])
		.when(isUnaryMethod, (found): TUnaryMethod => found)
		.otherwise((): never => {
			throw new Error(`${GRPC_CALL_ERROR.METHOD_MISSING}: ${method}`);
		});

export const grpcClientCreate = async (
	options: TGrpcClientOptions,
): Promise<TGrpcClient> => {
	const serviceCtor = await getServiceConstructor(
		options.protoPath,
		options.packageName,
		options.serviceName,
	);
	const client = new serviceCtor(
		options.address,
		grpc.credentials.createInsecure(),
	);

	const call = <TRequest, TResponse>(
		method: string,
		request: TRequest,
		decode: TResponseDecoder<TResponse>,
	): Promise<TResponse> =>
		new Promise((resolve, reject) => {
			unaryMethodOf(client, method).call(client, request, (error, response) => {
				match(error)
					.with(P.nullish, (): void => {
						try {
							resolve(decode(response));
						} catch (decodeError) {
							reject(decodeError);
						}
					})
					.otherwise((callError): void => reject(callError));
			});
		});

	const close = (): void => client.close();

	return { call, close };
};
