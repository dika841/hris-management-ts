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
import { Trash2 } from "lucide-react";
import type { FC, ReactElement } from "react";
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

	const handleDelete = (id: string, name: string) => {
		if (window.confirm(`Hapus data karyawan ${name}?`)) {
			deleteMutation.mutate({ id });
		}
	};

	return (
		<div className="rounded-lg border border-border/60 bg-card overflow-hidden">
			<Table>
				<TableHeader>
					<TableRow className="border-b border-border/40 bg-muted/30">
						<TableHead className="text-xs font-semibold">
							Kode Karyawan
						</TableHead>
						<TableHead className="text-xs font-semibold">
							Nama & Email
						</TableHead>
						<TableHead className="text-xs font-semibold">
							Departemen & Role
						</TableHead>
						<TableHead className="text-xs font-semibold">Status</TableHead>
						<TableHead className="text-xs font-semibold">
							Pajak (PTKP & Metode)
						</TableHead>
						<TableHead className="text-xs font-semibold text-right">
							Gaji Pokok
						</TableHead>
						<TableHead className="text-xs font-semibold text-center">
							UU PDP
						</TableHead>
						<TableHead className="text-xs font-semibold text-right w-16">
							Aksi
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
								Belum ada data karyawan terdaftar. Klik "Tambah Karyawan" untuk
								menambahkan.
							</TableCell>
						</TableRow>
					) : (
						list.items.map((emp: TEmployee) => (
							<TableRow
								key={emp.id}
								className="border-b border-border/30 hover:bg-muted/20"
							>
								<TableCell className="font-mono text-xs font-medium text-foreground">
									{emp.employeeCode}
								</TableCell>
								<TableCell>
									<div className="text-xs font-semibold text-foreground">
										{emp.fullName}
									</div>
									<div className="text-[11px] text-muted-foreground">
										{emp.email}
									</div>
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
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleDelete(emp.id, emp.fullName)}
										className="size-8 p-0 text-muted-foreground hover:text-destructive"
									>
										<Trash2 className="size-3.5" />
									</Button>
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	);
};
