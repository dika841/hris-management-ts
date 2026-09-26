import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { ActivitySection } from "#/routes/_authenticated/dashboard/_components/activity-section.tsx";
import { ComplianceOverviewCard } from "#/routes/_authenticated/dashboard/_components/compliance-overview-card.tsx";
import { HealthCard } from "#/routes/_authenticated/dashboard/_components/health-card.tsx";
import { HrisHeader } from "#/routes/_authenticated/dashboard/_components/hris-header.tsx";
import { HrisStatCards } from "#/routes/_authenticated/dashboard/_components/hris-stat-cards.tsx";
import { QuickActions } from "#/routes/_authenticated/dashboard/_components/quick-actions.tsx";
import { RecentPayrollPeriodsCard } from "#/routes/_authenticated/dashboard/_components/recent-payroll-periods-card.tsx";
import { TaxSimulatorWidget } from "#/routes/_authenticated/dashboard/_components/tax-simulator-widget.tsx";
import { useDashboardHealth } from "#/routes/_authenticated/dashboard/_hooks/use-dashboard.ts";

const DashboardPage: FC = (): ReactElement => {
	const health = useDashboardHealth();

	return (
		<div className="flex flex-col gap-6">
			{/* Executive & Regulatory Header */}
			<HrisHeader />

			{/* High-Impact Stat Cards */}
			<HrisStatCards />

			{/* Interactive Live PPh 21 TER (PMK 168/2023) Simulator */}
			<TaxSimulatorWidget />

			{/* Operational Grid */}
			<div className="grid gap-6 lg:grid-cols-12">
				{/* Kolom Kiri: Payroll Runs & Activity Audit Log */}
				<div className="flex flex-col gap-6 lg:col-span-7">
					<RecentPayrollPeriodsCard />
					<ActivitySection />
				</div>

				{/* Kolom Kanan: Governance, Quick Actions, System Health */}
				<div className="flex flex-col gap-6 lg:col-span-5">
					<ComplianceOverviewCard />
					<QuickActions />
					<HealthCard health={health} />
				</div>
			</div>
		</div>
	);
};

export const Route = createFileRoute("/_authenticated/dashboard/")({
	component: DashboardPage,
});
