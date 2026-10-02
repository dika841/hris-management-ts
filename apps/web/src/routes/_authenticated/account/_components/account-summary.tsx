import { Card, CardContent } from "@app/components/ui/card";
import { roleLabel } from "@app/messages";
import type { FC, ReactElement } from "react";
import { match, P } from "ts-pattern";
import { useSession } from "#/libs/auth/use-session.ts";
import { useI18n } from "#/libs/i18n/index.ts";

export const AccountSummary: FC = (): ReactElement => {
	const session = useSession();
	const { t } = useI18n();

	return match(session)
		.with(P.nullish, () => (
			<p className="text-sm text-muted-foreground">{t("auth.notSignedIn")}</p>
		))
		.otherwise((s) => (
			<Card>
				<CardContent>
					<dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
						<dt className="text-muted-foreground">{t("auth.fieldName")}</dt>
						<dd>{s.user.name}</dd>
						<dt className="text-muted-foreground">{t("auth.fieldEmail")}</dt>
						<dd>{s.user.email}</dd>
						<dt className="text-muted-foreground">{t("auth.fieldRole")}</dt>
						<dd>{roleLabel(s.user.role)}</dd>
					</dl>
				</CardContent>
			</Card>
		));
};
