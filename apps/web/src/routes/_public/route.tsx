import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { match, P } from "ts-pattern";
import { EServerUnreachable } from "#/libs/auth/server-unreachable.ts";
import { SESSION_REACH } from "#/libs/auth/session-reach.ts";

const PublicLayout: FC = (): ReactElement => <Outlet />;

export const Route = createFileRoute("/_public")({
	beforeLoad: ({ context }) => {
		match(context)
			.with({ reach: SESSION_REACH.UNREACHABLE }, () => {
				throw new EServerUnreachable();
			})
			.with({ session: P.nullish }, () => undefined)
			.otherwise(() => {
				throw redirect({ to: "/dashboard" });
			});
	},
	component: PublicLayout,
});
