import { Badge } from "@app/components/ui/badge";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@app/components/ui/card";
import { HEALTH_MESSAGE } from "@app/messages";
import type { FC, ReactElement } from "react";
import { match } from "ts-pattern";
import { useI18n } from "#/libs/i18n/index.ts";
import {
	HEALTH_VIEW_STATUS,
	type THealthViewStatus,
} from "#/routes/health/_constants/status.ts";
import type { TDashboardHealth } from "#/routes/_authenticated/dashboard/_hooks/use-dashboard.ts";

const statusVariant = (status: THealthViewStatus): "default" | "outline" =>
	match(status)
		.with(HEALTH_VIEW_STATUS.OK, (): "default" => "default")
		.otherwise((): "outline" => "outline");

const statusDotClass = (status: THealthViewStatus): string =>
	match(status)
		.with(HEALTH_VIEW_STATUS.CHECKING, () => "bg-muted-foreground")
		.with(HEALTH_VIEW_STATUS.OK, () => "bg-emerald-500")
		.with(HEALTH_VIEW_STATUS.DEGRADED, () => "bg-red-500")
		.exhaustive();

type THealthCardProps = {
	health: TDashboardHealth;
};

export const HealthCard: FC<THealthCardProps> = (props): ReactElement => {
	const { t, isIndonesian } = useI18n();

	const statusLabel = (status: THealthViewStatus): string =>
		match(status)
			.with(HEALTH_VIEW_STATUS.CHECKING, () =>
				isIndonesian ? "Memeriksa…" : HEALTH_MESSAGE.STATUS_CHECKING,
			)
			.with(HEALTH_VIEW_STATUS.OK, () =>
				isIndonesian ? "Normal" : HEALTH_MESSAGE.STATUS_OK,
			)
			.with(HEALTH_VIEW_STATUS.DEGRADED, () =>
				isIndonesian ? "Terganggu" : HEALTH_MESSAGE.STATUS_DEGRADED,
			)
			.exhaustive();

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="text-sm font-medium text-muted-foreground">
					{t("dashboard.systemHealth")}
				</CardTitle>
				<Badge variant={statusVariant(props.health.status)}>
					<span
						className={`mr-1.5 inline-block size-2 rounded-full ${statusDotClass(props.health.status)}`}
					/>
					{statusLabel(props.health.status)}
				</Badge>
			</CardHeader>
			<CardContent>
				<dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
					<dt className="text-muted-foreground">
						{isIndonesian ? "Versi Web" : HEALTH_MESSAGE.WEB_VERSION}
					</dt>
					<dd className="font-mono text-xs">{props.health.webVersion}</dd>
					<dt className="text-muted-foreground">
						{isIndonesian ? "Versi API" : HEALTH_MESSAGE.API_VERSION}
					</dt>
					<dd className="font-mono text-xs">
						{props.health.apiVersion ??
							(isIndonesian
								? "Tidak diketahui"
								: HEALTH_MESSAGE.VERSION_UNKNOWN)}
					</dd>
				</dl>
			</CardContent>
		</Card>
	);
};
