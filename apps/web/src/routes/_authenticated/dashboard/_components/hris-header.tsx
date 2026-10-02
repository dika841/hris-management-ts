import { Badge } from "@app/components/ui/badge";
import { CheckCircle2, Cpu, ShieldCheck } from "lucide-react";
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
					<Badge
						variant="outline"
						className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium text-xs px-2 py-0.5"
					>
						<span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
						{t("dashboard.aiActive")}
					</Badge>
				</div>
				<p className="text-sm text-muted-foreground">
					{t("dashboard.subtitle")}
				</p>
			</div>

			<div className="flex flex-wrap items-center gap-2">
				<Badge
					variant="outline"
					className="gap-1.5 py-1 px-2.5 text-xs font-normal border border-border/60 bg-muted/60"
				>
					<ShieldCheck className="size-3.5 text-blue-500" />
					<span>PMK 168/2023 TER</span>
				</Badge>
				<Badge
					variant="outline"
					className="gap-1.5 py-1 px-2.5 text-xs font-normal border border-border/60 bg-muted/60"
				>
					<CheckCircle2 className="size-3.5 text-emerald-500" />
					<span>UU PDP 27/2022</span>
				</Badge>
				<Badge
					variant="outline"
					className="gap-1.5 py-1 px-2.5 text-xs font-normal border border-border/60 bg-muted/60"
				>
					<Cpu className="size-3.5 text-violet-500" />
					<span>SLM Triad RAG</span>
				</Badge>
			</div>
		</div>
	);
};
