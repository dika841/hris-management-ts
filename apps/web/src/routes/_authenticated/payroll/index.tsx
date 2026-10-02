import { Guard } from "@app/components/guard/guard";
import { Button } from "@app/components/ui/button";
import { PERMISSION } from "@app/permissions";
import { payrollPeriodListInputSchema } from "@app/schemas";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Coins, Plus } from "lucide-react";
import type { FC, ReactElement } from "react";
import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import { useI18n } from "#/libs/i18n/index.ts";
import { searchLenient } from "#/libs/table/search-lenient.ts";
import { PayrollPeriodTable } from "#/routes/_authenticated/payroll/_components/payroll-period-table.tsx";
import {
	payrollPeriodListOptions,
	usePayrollPeriodList,
} from "#/routes/_authenticated/payroll/_hooks/use-payroll.ts";

const payrollSearchValidate = searchLenient(payrollPeriodListInputSchema);

const PayrollPage: FC = (): ReactElement => {
	const { data } = usePayrollPeriodList();
	const { t } = useI18n();

	return (
		<div className="flex flex-col gap-6">
			{/* Page Header */}
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
				<div>
					<div className="flex items-center gap-2">
						<div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
							<Coins className="size-4.5" />
						</div>
						<h1 className="text-xl font-bold tracking-tight text-foreground">
							{t("payroll.title")}
						</h1>
					</div>
					<p className="mt-1 text-xs text-muted-foreground">
						{t("payroll.subtitle")}
					</p>
				</div>

				<Guard permissions={[PERMISSION.PAYROLL_MANAGE]}>
					<Button size="sm" asChild className="gap-1.5 text-xs font-semibold">
						<Link to="/payroll/create">
							<Plus className="size-3.5" />
							{t("payroll.newPeriod")}
						</Link>
					</Button>
				</Guard>
			</div>

			{/* Payroll Periods Table */}
			<PayrollPeriodTable list={data} />
		</div>
	);
};

export const Route = createFileRoute("/_authenticated/payroll/")({
	validateSearch: payrollSearchValidate,
	beforeLoad: checkRoutePermissions({
		permissions: [PERMISSION.PAYROLL_READ],
	}),
	loaderDeps: ({ search }) => ({ search }),
	loader: ({ context, deps }) =>
		context.queryClient.ensureQueryData(payrollPeriodListOptions(deps.search)),
	component: PayrollPage,
});
