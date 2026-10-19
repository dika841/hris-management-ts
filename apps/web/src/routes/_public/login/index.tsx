import { loginSearchSchema } from "@app/schemas";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { LoginForm } from "#/routes/_public/login/_components/login-form.tsx";
import { LoginLayout } from "#/routes/_public/login/_components/login-layout.tsx";
import { LoginPendingScreen } from "#/routes/_public/login/_components/login-pending-screen.tsx";

const LoginPage: FC = (): ReactElement => (
	<LoginLayout>
		<LoginForm />
	</LoginLayout>
);

export const Route = createFileRoute("/_public/login/")({
	validateSearch: loginSearchSchema,
	component: LoginPage,
	pendingComponent: LoginPendingScreen,
});
