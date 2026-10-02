import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { useI18n } from "#/libs/i18n/index.ts";
import { AccountSummary } from "#/routes/_authenticated/account/_components/account-summary.tsx";
import { PasswordChangeForm } from "#/routes/_authenticated/account/_components/password-change-form.tsx";

const AccountPage: FC = (): ReactElement => {
	const { t } = useI18n();

	return (
		<div className="flex max-w-md flex-col gap-6">
			<h1 className="text-xl font-semibold">{t("auth.accountTitle")}</h1>
			<AccountSummary />
			<PasswordChangeForm />
		</div>
	);
};

export const Route = createFileRoute("/_authenticated/account/")({
	component: AccountPage,
});
