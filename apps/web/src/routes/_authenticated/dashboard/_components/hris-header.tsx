import type { FC, ReactElement } from "react";
import { useI18n } from "#/libs/i18n/index.ts";

export const HrisHeader: FC = (): ReactElement => {
	const { t } = useI18n();

	return (
		<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-border/40 pb-5">
			<div>
				<div className="flex items-center gap-2 mb-1">
					<h1 className="text-2xl font-bold tracking-tight text-foreground">
						{t("dashboard.title")}
					</h1>
				</div>
				<p className="text-sm text-muted-foreground">
					{t("dashboard.subtitle")}
				</p>
			</div>
		</div>
	);
};
