# @app/grpc

A gRPC server and client pair built on `@grpc/grpc-js` and `@grpc/proto-loader`, with `note.proto` as the sample contract and `grpc.test.ts` driving a real server and client in-process.

## Status

Nothing in the sample application imports this package. It is kept on purpose: the repository is a boilerplate, and a working gRPC transport is part of what it offers to a project that needs one, even though the sample notes application talks HTTP and RPC only. Do not remove it on the grounds that the sample app has no consumer.

## Credentials

Both `grpcClientCreate` and `grpcServerCreate` use insecure credentials (`createInsecure`), which is the right default for a local process-to-process call and for the test suite, and the wrong one for anything that crosses a network boundary. A project that adopts this package for service-to-service traffic should pass TLS credentials from its own configuration before the first deployment, and should wire that choice into `envSchema` the way `METRICS_TOKEN` is, so production refuses to start without it.

## Using it

`grpcServerCreate` takes the proto path, package and service names, a bind address and a map of handlers; `grpcClientCreate` takes the same contract and an address and exposes a promise-based `call(method, request, decode)`, where `decode` turns the untyped response into the caller's type or throws, so nothing crosses the wire boundary as a bare cast. `grpc.test.ts` is the reference for both.
