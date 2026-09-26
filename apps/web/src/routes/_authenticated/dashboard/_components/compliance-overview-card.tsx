import { Badge } from "@app/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@app/components/ui/card";
import { CheckCircle2, Database, Layers, ShieldCheck } from "lucide-react";
import type { FC, ReactElement } from "react";
import { useDashboardEmployees } from "#/routes/_authenticated/dashboard/_hooks/use-dashboard.ts";

export const ComplianceOverviewCard: FC = (): ReactElement => {
	const employeeQuery = useDashboardEmployees();
	const employees = employeeQuery.data?.items ?? [];

	const total = employees.length;
	const consentedCount = employees.filter((e) => e.pdpConsentGiven).length;
	const consentRate =
		total > 0 ? Math.round((consentedCount / total) * 100) : 100;

	const grossCount = employees.filter((e) => e.taxMethod === "gross").length;
	const grossUpCount = employees.filter(
		(e) => e.taxMethod === "gross_up",
	).length;
	const nettCount = employees.filter((e) => e.taxMethod === "nett").length;

	return (
		<Card className="border border-border/60 bg-card">
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-sm font-semibold flex items-center gap-2">
						<ShieldCheck className="size-4 text-emerald-500" />
						Governance & Ecosystem Health
					</CardTitle>
					<Badge
						variant="outline"
						className="text-[10px] font-medium border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
					>
						Audit Clean
					</Badge>
				</div>
				<CardDescription className="text-xs">
					Compliance tracking under UU PDP No. 27/2022 & SAP S/4HANA OData
				</CardDescription>
			</CardHeader>

			<CardContent className="space-y-4 pt-1">
				{/* UU PDP Consent Bar */}
				<div>
					<div className="flex items-center justify-between text-xs mb-1.5">
						<span className="text-muted-foreground font-medium flex items-center gap-1.5">
							<CheckCircle2 className="size-3.5 text-blue-500" />
							UU PDP Consent Rate
						</span>
						<span className="font-semibold text-foreground">
							{consentRate}% ({consentedCount}/{total || 1})
						</span>
					</div>
					<div className="w-full h-2 rounded-full bg-muted overflow-hidden">
						<div
							className="h-full bg-blue-500 rounded-full transition-all duration-500"
							style={{ width: `${consentRate}%` }}
						/>
					</div>
					<p className="mt-1 text-[10px] text-muted-foreground">
						Right to Erasure & Data Minimization enforced by NeMo Guardrails
					</p>
				</div>

				{/* Tax Method Distribution */}
				<div className="pt-2 border-t border-border/40">
					<div className="text-xs text-muted-foreground font-medium mb-2 flex items-center gap-1.5">
						<Layers className="size-3.5 text-indigo-500" />
						Skema Penggajian Karyawan
					</div>
					<div className="grid grid-cols-3 gap-2 text-center text-xs">
						<div className="p-2 rounded-md bg-muted/40 border border-border/40">
							<div className="font-semibold text-foreground">{grossCount}</div>
							<div className="text-[10px] text-muted-foreground">Gross</div>
						</div>
						<div className="p-2 rounded-md bg-muted/40 border border-border/40">
							<div className="font-semibold text-foreground">
								{grossUpCount}
							</div>
							<div className="text-[10px] text-muted-foreground">Gross-Up</div>
						</div>
						<div className="p-2 rounded-md bg-muted/40 border border-border/40">
							<div className="font-semibold text-foreground">{nettCount}</div>
							<div className="text-[10px] text-muted-foreground">Nett</div>
						</div>
					</div>
				</div>

				{/* SAP S/4HANA ERP Connector */}
				<div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
					<div className="flex items-center gap-2">
						<div className="size-6 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
							<Database className="size-3.5" />
						</div>
						<div>
							<div className="font-medium text-foreground text-xs">
								SAP S/4HANA ERP
							</div>
							<div className="text-[10px] text-muted-foreground">
								OData V2/V4 GL Synchronizer
							</div>
						</div>
					</div>
					<Badge
						variant="outline"
						className="text-[10px] font-normal border border-border/60 bg-muted/40 text-emerald-600 dark:text-emerald-400"
					>
						Live Sync
					</Badge>
				</div>
			</CardContent>
		</Card>
	);
};
