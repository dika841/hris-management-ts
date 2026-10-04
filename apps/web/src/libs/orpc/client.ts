import type { TAppRouterClient } from "@app/api";
import { D } from "@mobily/ts-belt";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

const rawApiBase = import.meta.env.DEV
	? window.location.origin
	: (import.meta.env.VITE_API_URL ?? window.location.origin);

const API_BASE = rawApiBase.endsWith("/")
	? rawApiBase.slice(0, -1)
	: rawApiBase;

const link = new RPCLink({
	url: `${API_BASE}/rpc`,
	fetch: (input, init) =>
		fetch(input, D.merge(init ?? {}, { credentials: "include" as const })),
});

export const client: TAppRouterClient = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
