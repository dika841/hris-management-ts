import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { match, P } from "ts-pattern";

const PROTO_LOAD_OPTIONS: protoLoader.Options = {
	keepCase: true,
	longs: String,
	enums: String,
	defaults: true,
	oneofs: true,
};

export const GRPC_LOAD_ERROR = {
	PACKAGE_MISSING: "gRPC package not found in the proto definition",
	SERVICE_MISSING: "gRPC service not found in the proto package",
} as const;

export type TGrpcServiceClient = grpc.ServiceClientConstructor & {
	service: grpc.ServiceDefinition;
};

type TPackageNode = grpc.GrpcObject[string] | undefined;

const isNamespace = (node: TPackageNode): node is grpc.GrpcObject =>
	typeof node === "object" && node !== null && !("service" in node);

const isServiceConstructor = (node: TPackageNode): node is TGrpcServiceClient =>
	typeof node === "function" && "service" in node;

const namespaceStep = (
	node: grpc.GrpcObject,
	segment: string,
	packageName: string,
): grpc.GrpcObject =>
	match(node[segment])
		.when(isNamespace, (found): grpc.GrpcObject => found)
		.otherwise((): never => {
			throw new Error(`${GRPC_LOAD_ERROR.PACKAGE_MISSING}: ${packageName}`);
		});

export const getServiceConstructor = async (
	protoPath: string,
	packageName: string,
	serviceName: string,
): Promise<TGrpcServiceClient> => {
	const packageDefinition = await protoLoader.load(
		protoPath,
		PROTO_LOAD_OPTIONS,
	);
	const packageObject = grpc.loadPackageDefinition(packageDefinition);
	const namespace = packageName
		.split(".")
		.reduce<grpc.GrpcObject>(
			(node, segment) => namespaceStep(node, segment, packageName),
			packageObject,
		);

	return match(namespace[serviceName])
		.when(isServiceConstructor, (found): TGrpcServiceClient => found)
		.with(P._, (): never => {
			throw new Error(
				`${GRPC_LOAD_ERROR.SERVICE_MISSING}: ${packageName}.${serviceName}`,
			);
		})
		.exhaustive();
};
