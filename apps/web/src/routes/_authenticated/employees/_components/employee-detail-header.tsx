import { Button } from "@app/components/ui/button";
import { formatDate } from "@app/format";
import type { TEmployee } from "@app/schemas";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Building2, Calendar, FilePlus2, RefreshCw, UserCheck } from "lucide-react";
import type { FC, ReactElement } from "react";
import { EmploymentStatusBadge } from "./employee-status-badge.tsx";

type TProps = {
	employee: TEmployee;
};

export const EmployeeDetailHeader: FC<TProps> = ({ employee }): ReactElement => {
	const initials = employee.fullName
		.split(" ")
		.map((n) => n[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
					<Link to="/employees">
						<ArrowLeft className="size-3.5" />
						Daftar Karyawan
					</Link>
				</Button>
			</div>

			<div className="flex flex-col gap-4 rounded-xl border border-border/70 bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-4">
					<div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-lg border border-primary/20 shadow-inner">
						{initials}
					</div>
					<div>
						<div className="flex items-center gap-2.5">
							<h1 className="text-xl font-bold tracking-tight text-foreground">
								{employee.fullName}
							</h1>
							<EmploymentStatusBadge status={employee.employmentStatus} />
						</div>
						<div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
							<span className="font-mono font-medium text-foreground/80">
								{employee.employeeCode}
							</span>
							<span className="flex items-center gap-1">
								<Building2 className="size-3 text-muted-foreground" />
								{employee.department} • {employee.position}
							</span>
							<span className="flex items-center gap-1">
								<Calendar className="size-3 text-muted-foreground" />
								Bergabung {formatDate(employee.joinDate)}
							</span>
						</div>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<Button size="sm" variant="outline" asChild className="gap-1.5 text-xs font-medium">
						<Link to="/employees/$employeeId/contracts/create" params={{ employeeId: employee.id }}>
							<FilePlus2 className="size-3.5" />
							Buat Kontrak
						</Link>
					</Button>
					{employee.employmentStatus === "contract" && (
						<>
							<Button size="sm" variant="outline" asChild className="gap-1.5 text-xs font-medium border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10">
								<Link to="/employees/$employeeId/contracts/renew" params={{ employeeId: employee.id }}>
									<RefreshCw className="size-3.5" />
									Perpanjang PKWT
								</Link>
							</Button>
							<Button size="sm" variant="default" asChild className="gap-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white">
								<Link to="/employees/$employeeId/contracts/convert" params={{ employeeId: employee.id }}>
									<UserCheck className="size-3.5" />
									Pengangkatan PKWTT
								</Link>
							</Button>
						</>
					)}
				</div>
			</div>
		</div>
	);
};
