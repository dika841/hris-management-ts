import { Card, CardContent } from "@app/components/ui/card";
import { formatRupiah } from "@app/format";
import { Link } from "@tanstack/react-router";
import {
	ArrowUpRight,
	BadgePercent,
	Coins,
	ShieldCheck,
	TrendingUp,
	Users,
} from "lucide-react";
import type { FC, ReactElement } from "react";
import { useI18n } from "#/libs/i18n/index.ts";
import {
	useDashboardEmployeeStats,
	useDashboardPayrollPeriods,
} from "#/routes/_authenticated/dashboard/_hooks/use-dashboard.ts";

export const HrisStatCards: FC = (): ReactElement => {
	const employeeQuery = useDashboardEmployeeStats();
	const payrollQuery = useDashboardPayrollPeriods();
	const { t, isIndonesian } = useI18n();

	const stats = employeeQuery.data;
	const totalEmployees = stats?.total ?? 0;
	const permanentCount = stats?.permanent ?? 0;
	const contractCount = stats?.contract ?? 0;
	const pdpConsentCount = stats?.pdpConsent ?? 0;
	const pdpConsentRate =
		totalEmployees > 0
			? Math.round((pdpConsentCount / totalEmployees) * 100)
			: 100;

	const periods = payrollQuery.data?.items ?? [];
	const latestPeriod = periods[0];
	const totalNetPay = latestPeriod?.totalNetPay ?? 0;
	const totalPph21 = latestPeriod?.totalPph21 ?? 0;
	const totalGross = latestPeriod?.totalGross ?? 0;

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{/* Card 1: Total Active Workforce */}
			<Card className="relative overflow-hidden border border-border/60 bg-card hover:border-primary/30 transition-all duration-200">
				<CardContent className="p-5">
					<div className="flex items-center justify-between">
						<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							{t("dashboard.activeWorkforce")}
						</span>
						<div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
							<Users className="size-4.5" />
						</div>
					</div>
					<div className="mt-3 flex items-baseline gap-2">
						<span className="text-3xl font-bold tracking-tight text-foreground">
							{totalEmployees}
						</span>
						<span className="text-xs text-muted-foreground font-medium">
							{t("dashboard.employees")}
						</span>
					</div>
					<div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3 text-xs text-muted-foreground">
						<div className="flex items-center gap-1.5">
							<span className="size-1.5 rounded-full bg-emerald-500" />
							<span>
								{permanentCount} {t("dashboard.permanent")}
							</span>
							<span className="text-border">|</span>
							<span>
								{contractCount} {t("dashboard.contract")}
							</span>
						</div>
						<Link
							to="/employees"
							className="inline-flex items-center gap-0.5 text-primary hover:underline font-medium"
						>
							{t("dashboard.manage")} <ArrowUpRight className="size-3" />
						</Link>
					</div>
				</CardContent>
			</Card>

			{/* Card 2: Monthly Disbursed Net Pay */}
			<Card className="relative overflow-hidden border border-border/60 bg-card hover:border-primary/30 transition-all duration-200">
				<CardContent className="p-5">
					<div className="flex items-center justify-between">
						<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							{t("dashboard.disbursedNetPayroll")}
						</span>
						<div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
							<Coins className="size-4.5" />
						</div>
					</div>
					<div className="mt-3 flex items-baseline gap-2">
						<span className="text-2xl font-bold tracking-tight text-foreground">
							{totalNetPay > 0 ? formatRupiah(totalNetPay) : "Rp 0"}
						</span>
					</div>
					<div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3 text-xs text-muted-foreground">
						<span className="truncate">
							{t("dashboard.gross")}:{" "}
							{totalGross > 0 ? formatRupiah(totalGross) : "Rp 0"}
						</span>
						<Link
							to="/payroll"
							className="inline-flex items-center gap-0.5 text-primary hover:underline font-medium shrink-0"
						>
							{t("dashboard.period")} <ArrowUpRight className="size-3" />
						</Link>
					</div>
				</CardContent>
			</Card>

			{/* Card 3: PPh 21 TER Withholding */}
			<Card className="relative overflow-hidden border border-border/60 bg-card hover:border-primary/30 transition-all duration-200">
				<CardContent className="p-5">
					<div className="flex items-center justify-between">
						<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							{t("dashboard.pph21TerWithheld")}
						</span>
						<div className="flex size-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
							<BadgePercent className="size-4.5" />
						</div>
					</div>
					<div className="mt-3 flex items-baseline gap-2">
						<span className="text-2xl font-bold tracking-tight text-foreground">
							{totalPph21 > 0 ? formatRupiah(totalPph21) : "Rp 0"}
						</span>
					</div>
					<div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3 text-xs text-muted-foreground">
						<span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
							<TrendingUp className="size-3" /> PMK 168/2023 TER
						</span>
						<span className="text-xs">
							{latestPeriod?.name ?? t("dashboard.currentPeriod")}
						</span>
					</div>
				</CardContent>
			</Card>

			{/* Card 4: PDP Consent Compliance */}
			<Card className="relative overflow-hidden border border-border/60 bg-card hover:border-primary/30 transition-all duration-200">
				<CardContent className="p-5">
					<div className="flex items-center justify-between">
						<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							{isIndonesian ? "Kepatuhan UU PDP" : "PDP Compliance"}
						</span>
						<div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
							<ShieldCheck className="size-4.5" />
						</div>
					</div>
					<div className="mt-3 flex items-baseline gap-2">
						<span className="text-3xl font-bold tracking-tight text-foreground">
							{pdpConsentRate}%
						</span>
						<span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
							{isIndonesian ? "Consent tercatat" : "Consent recorded"}
						</span>
					</div>
					<div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3 text-xs text-muted-foreground">
						<span className="truncate">
							{pdpConsentCount}/{totalEmployees}{" "}
							{isIndonesian ? "karyawan" : "employees"}
						</span>
						<span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
							UU 27/2022
						</span>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
