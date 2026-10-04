import { A } from "@mobily/ts-belt";
import { getConnInfo } from "@hono/node-server/conninfo";
import type { Context } from "hono";

const UNKNOWN_IDENTIFIER = "unknown";

export type TRateLimitIdentifierInput = {
	remoteAddress: string | undefined;
	forwardedFor: string | undefined;
	trustedProxyIps: readonly string[];
};

const forwardedAddressFirst = (
	forwardedFor: string | undefined,
): string | undefined => forwardedFor?.split(",")[0]?.trim() || undefined;

export const rateLimitIdentifierFrom = (
	input: TRateLimitIdentifierInput,
): string => {
	const remoteAddress = input.remoteAddress ?? UNKNOWN_IDENTIFIER;
	return A.includes(input.trustedProxyIps, remoteAddress)
		? (forwardedAddressFirst(input.forwardedFor) ?? remoteAddress)
		: remoteAddress;
};

const remoteAddressOf = (context: Context): string | undefined => {
	const cfConnectingIp = context.req.header("cf-connecting-ip");
	if (cfConnectingIp) return cfConnectingIp;

	const realIp = context.req.header("x-real-ip");
	if (realIp) return realIp;

	try {
		return getConnInfo(context)?.remote?.address;
	} catch {
		return undefined;
	}
};

export const rateLimitIdentifierOf = (
	context: Context,
	trustedProxyIps: readonly string[],
): string =>
	rateLimitIdentifierFrom({
		remoteAddress: remoteAddressOf(context),
		forwardedFor: context.req.header("x-forwarded-for"),
		trustedProxyIps,
	});
