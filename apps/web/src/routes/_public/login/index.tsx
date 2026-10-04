import { loginSearchSchema } from "@app/schemas";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { AppLogo } from "#/routes/_components/app-logo.tsx";
import { LanguageSwitcher } from "#/libs/i18n/index.ts";
import { LoginForm } from "#/routes/_public/login/_components/login-form.tsx";

const LoginPage: FC = (): ReactElement => {
	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex items-center justify-between">
					<Link to="/" className="flex items-center gap-2.5 font-medium">
						<AppLogo className="size-7 rounded-lg shadow-xs" />
						<span className="font-semibold tracking-tight">
							HRIS Management
						</span>
					</Link>
					<LanguageSwitcher variant="header" />
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-xs">
						<LoginForm />
					</div>
				</div>
			</div>
			<div className="bg-muted relative hidden lg:block overflow-hidden">
				<img
					src="/auth-banner.webp"
					alt="HRIS Management Authentication Banner"
					className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.8]"
				/>
			</div>
		</div>
	);
};

export const Route = createFileRoute("/_public/login/")({
	validateSearch: loginSearchSchema,
	component: LoginPage,
});
