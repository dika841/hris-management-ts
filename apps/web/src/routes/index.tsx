import { createFileRoute, redirect } from "@tanstack/react-router";
import { match, P } from "ts-pattern";
import { EServerUnreachable } from "#/libs/auth/server-unreachable.ts";
import { SESSION_REACH } from "#/libs/auth/session-reach.ts";

export const Route = createFileRoute("/")({
	beforeLoad: ({ context }) => {
		match(context)
			.with({ reach: SESSION_REACH.UNREACHABLE }, () => {
				throw new EServerUnreachable();
			})
			.with({ session: P.nullish }, () => {
				throw redirect({ to: "/login" });
			})
			.otherwise(() => {
				throw redirect({ to: "/dashboard" });
			});
	},
});
