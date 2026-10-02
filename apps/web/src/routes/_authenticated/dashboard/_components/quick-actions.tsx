import { Guard } from "@app/components/guard/guard";
import { Button } from "@app/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@app/components/ui/card";
import { PERMISSION } from "@app/permissions";
import { Link } from "@tanstack/react-router";
import { Activity, Calculator, Plus, UserPlus } from "lucide-react";
import type { FC, ReactElement } from "react";
import { useI18n } from "#/libs/i18n/index.ts";

export const QuickActions: FC = (): ReactElement => {
	const { t } = useI18n();

	return (
		<Card className="border border-border/60 bg-card">
			<CardHeader className="pb-3">
				<CardTitle className="text-sm font-semibold text-foreground">
					{t("dashboard.quickActions")}
				</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-2">
				<Guard permissions={[PERMISSION.EMPLOYEE_MANAGE]}>
					<Button
						variant="outline"
						size="sm"
						className="justify-start gap-2 h-9 text-xs border-border/60 hover:bg-muted font-medium"
						asChild
					>
						<Link to="/employees/create">
							<UserPlus className="size-3.5 text-blue-500" />
							{t("dashboard.addEmployee")}
						</Link>
					</Button>
				</Guard>
				<Guard permissions={[PERMISSION.PAYROLL_MANAGE]}>
					<Button
						variant="outline"
						size="sm"
						className="justify-start gap-2 h-9 text-xs border-border/60 hover:bg-muted font-medium"
						asChild
					>
						<Link to="/payroll/create">
							<Calculator className="size-3.5 text-emerald-500" />
							{t("dashboard.openPayroll")}
						</Link>
					</Button>
				</Guard>
				<Guard permissions={[PERMISSION.USER_MANAGE]}>
					<Button
						variant="outline"
						size="sm"
						className="justify-start gap-2 h-9 text-xs border-border/60 hover:bg-muted font-medium"
						asChild
					>
						<Link to="/users/create">
							<Plus className="size-3.5 text-indigo-500" />
							{t("dashboard.newUser")}
						</Link>
					</Button>
				</Guard>
				<Guard permissions={[PERMISSION.ACTIVITY_READ]}>
					<Button
						variant="ghost"
						size="sm"
						className="justify-start gap-2 h-9 text-xs text-muted-foreground hover:text-foreground font-medium"
						asChild
					>
						<Link to="/activity">
							<Activity className="size-3.5 text-amber-500" />
							{t("dashboard.auditLog")}
						</Link>
					</Button>
				</Guard>
			</CardContent>
		</Card>
	);
};
