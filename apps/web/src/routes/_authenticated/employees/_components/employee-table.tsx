import { Button } from "@app/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@app/components/ui/table";
import { formatRupiah } from "@app/format";
import type { TEmployee, TEmployeeList } from "@app/schemas";
import { Link } from "@tanstack/react-router";
import { Eye, Trash2 } from "lucide-react";
import type { FC, ReactElement } from "react";
import { useI18n } from "#/libs/i18n/index.ts";
import {
	EmploymentStatusBadge,
	PdpConsentBadge,
	TaxMethodBadge,
} from "#/routes/_authenticated/employees/_components/employee-status-badge.tsx";
import { useEmployeeDelete } from "#/routes/_authenticated/employees/_hooks/use-employees.ts";

type TEmployeeTableProps = {
	list: TEmployeeList;
};

export const EmployeeTable: FC<TEmployeeTableProps> = ({
	list,
}): ReactElement => {
	const deleteMutation = useEmployeeDelete();
	const { t, isIndonesian } = useI18n();

	const handleDelete = (id: string, name: string) => {
		if (window.confirm(t("employee.deleteConfirm", { name }))) {
			deleteMutation.mutate({ id });
		}
	};

	return (
		<div className="rounded-lg border border-border/60 bg-card overflow-hidden">
			<Table>
				<TableHeader>
					<TableRow className="border-b border-border/40 bg-muted/30">
						<TableHead className="text-xs font-semibold">
							{t("employee.code")}
						</TableHead>
						<TableHead className="text-xs font-semibold">
							{isIndonesian ? "Nama & Email" : "Name & Email"}
						</TableHead>
						<TableHead className="text-xs font-semibold">
							{isIndonesian ? "Departemen & Jabatan" : "Department & Position"}
						</TableHead>
						<TableHead className="text-xs font-semibold">
							{t("app.status")}
						</TableHead>
						<TableHead className="text-xs font-semibold">
							{isIndonesian ? "Pajak (PTKP & Metode)" : "Tax (PTKP & Method)"}
						</TableHead>
						<TableHead className="text-xs font-semibold text-right">
							{isIndonesian ? "Gaji Pokok" : "Basic Salary"}
						</TableHead>
						<TableHead className="text-xs font-semibold text-center">
							UU PDP
						</TableHead>
						<TableHead className="text-xs font-semibold text-right w-24">
							{t("app.actions")}
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{list.items.length === 0 ? (
						<TableRow>
							<TableCell
								colSpan={8}
								className="py-8 text-center text-xs text-muted-foreground"
							>
								{t("employee.empty")}
							</TableCell>
						</TableRow>
					) : (
						list.items.map((emp: TEmployee) => (
							<TableRow
								key={emp.id}
								className="border-b border-border/30 hover:bg-muted/20"
							>
								<TableCell className="font-mono text-xs font-medium text-foreground">
									<Link
										to="/employees/$employeeId"
										params={{ employeeId: emp.id }}
										className="text-primary hover:underline font-semibold"
									>
										{emp.employeeCode}
									</Link>
								</TableCell>
								<TableCell>
									<Link
										to="/employees/$employeeId"
										params={{ employeeId: emp.id }}
										className="block hover:underline"
									>
										<div className="text-xs font-semibold text-foreground">
											{emp.fullName}
										</div>
										<div className="text-[11px] text-muted-foreground">
											{emp.email}
										</div>
									</Link>
								</TableCell>
								<TableCell>
									<div className="text-xs text-foreground font-medium">
										{emp.department}
									</div>
									<div className="text-[11px] text-muted-foreground">
										{emp.position}
									</div>
								</TableCell>
								<TableCell>
									<EmploymentStatusBadge status={emp.employmentStatus} />
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-1.5">
										<span className="font-mono text-xs font-semibold text-foreground">
											{emp.ptkpCode}
										</span>
										<TaxMethodBadge method={emp.taxMethod} />
									</div>
								</TableCell>
								<TableCell className="text-right font-mono text-xs font-semibold text-foreground">
									{formatRupiah(emp.basicSalary)}
								</TableCell>
								<TableCell className="text-center">
									<PdpConsentBadge consent={emp.pdpConsentGiven} />
								</TableCell>
								<TableCell className="text-right">
									<div className="flex items-center justify-end gap-1">
										<Button
											variant="ghost"
											size="sm"
											asChild
											className="size-8 p-0 text-muted-foreground hover:text-foreground"
											title={t("app.details")}
										>
											<Link
												to="/employees/$employeeId"
												params={{ employeeId: emp.id }}
											>
												<Eye className="size-3.5" />
											</Link>
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleDelete(emp.id, emp.fullName)}
											className="size-8 p-0 text-muted-foreground hover:text-destructive"
											title={t("app.delete")}
										>
											<Trash2 className="size-3.5" />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	);
};
