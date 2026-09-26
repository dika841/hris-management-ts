import { Guard } from "@app/components/guard/guard";
import { Button } from "@app/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@app/components/ui/card";
import { DASHBOARD_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import { Link } from "@tanstack/react-router";
import { Activity, Calculator, Plus, UserPlus } from "lucide-react";
import type { FC, ReactElement } from "react";

export const QuickActions: FC = (): ReactElement => (
	<Card className="border border-border/60 bg-card">
		<CardHeader className="pb-3">
			<CardTitle className="text-sm font-semibold text-foreground">
				{DASHBOARD_MESSAGE.QUICK_ACTIONS}
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
						Tambah Data Karyawan
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
						Buka Siklus Penggajian
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
						{DASHBOARD_MESSAGE.CREATE_USER}
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
						Log Audit Sistem UU PDP
					</Link>
				</Button>
			</Guard>
		</CardContent>
	</Card>
);
