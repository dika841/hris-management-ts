import { Badge } from "@app/components/ui/badge";
import { Button } from "@app/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@app/components/ui/card";
import { formatRupiah } from "@app/format";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, CalendarDays, Coins } from "lucide-react";
import type { FC, ReactElement } from "react";
import { useDashboardPayrollPeriods } from "#/routes/_authenticated/dashboard/_hooks/use-dashboard.ts";

export const RecentPayrollPeriodsCard: FC = (): ReactElement => {
	const payrollQuery = useDashboardPayrollPeriods();
	const periods = payrollQuery.data?.items ?? [];

	return (
		<Card className="border border-border/60 bg-card">
			<CardHeader className="pb-3 flex flex-row items-center justify-between">
				<div>
					<CardTitle className="text-sm font-semibold flex items-center gap-2">
						<Coins className="size-4 text-emerald-500" />
						Recent Payroll Runs
					</CardTitle>
					<CardDescription className="text-xs">
						Monthly execution cycles and tax reconciliation
					</CardDescription>
				</div>
				<Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" asChild>
					<Link to="/payroll">
						View All <ArrowUpRight className="size-3" />
					</Link>
				</Button>
			</CardHeader>

			<CardContent className="space-y-2.5 pt-1">
				{periods.length === 0 ? (
					<div className="py-6 text-center text-xs text-muted-foreground">
						<CalendarDays className="size-6 mx-auto mb-2 text-muted-foreground/60" />
						No payroll periods executed yet.
					</div>
				) : (
					periods.slice(0, 4).map((p) => (
						<div
							key={p.id}
							className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-muted/20 hover:bg-muted/40 transition-colors text-xs"
						>
							<div>
								<div className="font-medium text-foreground">{p.name}</div>
								<div className="text-[10px] text-muted-foreground mt-0.5">
									Pay Date: {p.payDate} &bull; {p.totalEmployees} Employees
								</div>
							</div>
							<div className="text-right">
								<div className="font-semibold text-foreground">
									{p.totalNetPay > 0 ? formatRupiah(p.totalNetPay) : "Rp 0"}
								</div>
								<Badge
									variant="outline"
									className={`text-[9px] uppercase px-1.5 py-0 mt-0.5 ${
										p.status === "approved" || p.status === "paid"
											? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
											: "border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10"
									}`}
								>
									{p.status}
								</Badge>
							</div>
						</div>
					))
				)}
			</CardContent>
		</Card>
	);
};
