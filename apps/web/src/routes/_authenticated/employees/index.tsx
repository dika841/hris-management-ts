import { Guard } from "@app/components/guard/guard";
import { Button } from "@app/components/ui/button";
import { PERMISSION } from "@app/permissions";
import { employeeListInputSchema } from "@app/schemas";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Users } from "lucide-react";
import type { FC, ReactElement } from "react";
import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import { useI18n } from "#/libs/i18n/index.ts";
import { searchLenient } from "#/libs/table/search-lenient.ts";
import { EmployeeTable } from "#/routes/_authenticated/employees/_components/employee-table.tsx";
import {
	employeeListOptions,
	useEmployeeList,
} from "#/routes/_authenticated/employees/_hooks/use-employees.ts";

const employeeSearchValidate = searchLenient(employeeListInputSchema);

const EmployeesPage: FC = (): ReactElement => {
	const { data } = useEmployeeList();
	const { t } = useI18n();

	return (
		<div className="flex flex-col gap-6">
			{/* Page Header */}
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
				<div>
					<div className="flex items-center gap-2">
						<div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
							<Users className="size-4.5" />
						</div>
						<h1 className="text-xl font-bold tracking-tight text-foreground">
							{t("employee.title")}
						</h1>
					</div>
					<p className="mt-1 text-xs text-muted-foreground">
						{t("employee.subtitle")}
					</p>
				</div>

				<Guard permissions={[PERMISSION.EMPLOYEE_MANAGE]}>
					<Button size="sm" asChild className="gap-1.5 text-xs font-semibold">
						<Link to="/employees/create">
							<Plus className="size-3.5" />
							{t("employee.newEmployee")}
						</Link>
					</Button>
				</Guard>
			</div>

			{/* Employee Table */}
			<EmployeeTable list={data} />
		</div>
	);
};

export const Route = createFileRoute("/_authenticated/employees/")({
	validateSearch: employeeSearchValidate,
	beforeLoad: checkRoutePermissions({
		permissions: [PERMISSION.EMPLOYEE_READ],
	}),
	loaderDeps: ({ search }) => ({ search }),
	loader: ({ context, deps }) =>
		context.queryClient.ensureQueryData(employeeListOptions(deps.search)),
	component: EmployeesPage,
});
