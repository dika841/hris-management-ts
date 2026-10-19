import { Button } from "@app/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@app/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@app/components/ui/table";
import { formatDate, formatRupiah } from "@app/format";
import { PERMISSION } from "@app/permissions";
import type { TPayrollItem } from "@app/schemas";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download, Printer } from "lucide-react";
import type { FC, ReactElement } from "react";
import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import {
	payrollPeriodGetOptions,
	payrollReportItemsOptions,
	usePayrollPeriodGet,
	usePayrollReportItems,
} from "#/routes/_authenticated/payroll/_hooks/use-payroll.ts";

const csvEscape = (value: string | number | null): string => {
	const text = value === null ? "" : String(value);
	return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

const PayrollReportPage: FC = (): ReactElement => {
	const { periodId } = Route.useParams();
	const { data: period } = usePayrollPeriodGet(periodId);
	const { data: items } = usePayrollReportItems(periodId);

	const totals = items.reduce(
		(acc, item) => ({
			gross: acc.gross + item.grossTotal,
			pph21: acc.pph21 + item.tax.pph21Monthly,
			employeeBpjs: acc.employeeBpjs + item.bpjs.totalEmployeeBpjs,
			companyBpjs: acc.companyBpjs + item.bpjs.totalCompanyBpjs,
			netPay: acc.netPay + item.netPay,
		}),
		{ gross: 0, pph21: 0, employeeBpjs: 0, companyBpjs: 0, netPay: 0 },
	);

	const downloadCsv = (): void => {
		const header = [
			"Kode",
			"Nama",
			"Departemen",
			"Bruto",
			"PPh 21",
			"BPJS Karyawan",
			"BPJS Perusahaan",
			"Net Pay",
			"TER",
		];
		const lines = [
			header.join(","),
			...items.map((item) =>
				[
					item.employeeCode,
					item.employeeName,
					item.department,
					item.grossTotal,
					item.tax.pph21Monthly,
					item.bpjs.totalEmployeeBpjs,
					item.bpjs.totalCompanyBpjs,
					item.netPay,
					item.tax.terCategory,
				]
					.map(csvEscape)
					.join(","),
			),
		];
		const blob = new Blob([`\uFEFF${lines.join("\n")}`], {
			type: "text/csv;charset=utf-8",
		});
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = `laporan-payroll-${period.name}.csv`;
		anchor.click();
		URL.revokeObjectURL(url);
	};

	const metrics = [
		{ label: "Total Bruto", value: totals.gross },
		{ label: "PPh 21", value: totals.pph21 },
		{ label: "BPJS Karyawan", value: totals.employeeBpjs },
		{ label: "BPJS Perusahaan", value: totals.companyBpjs },
		{ label: "Total Net Pay", value: totals.netPay },
	];

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
				<div className="flex flex-col gap-2">
					<Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
						<Link to="/payroll/$periodId" params={{ periodId }}>
							<ArrowLeft className="size-3.5" />
							Kembali ke Periode
						</Link>
					</Button>
					<h1 className="text-xl font-bold tracking-tight">
						Laporan Payroll & PPh 21
					</h1>
					<p className="text-xs text-muted-foreground">
						{period.name} · Tanggal bayar {formatDate(period.payDate)}
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button size="sm" variant="outline" onClick={downloadCsv}>
						<Download className="size-3.5" />
						Export CSV
					</Button>
					<Button size="sm" onClick={() => window.print()}>
						<Printer className="size-3.5" />
						Cetak
					</Button>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
				{metrics.map((metric) => (
					<Card key={metric.label}>
						<CardHeader className="pb-2">
							<CardTitle className="text-xs text-muted-foreground">
								{metric.label}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-lg font-bold">{formatRupiah(metric.value)}</p>
						</CardContent>
					</Card>
				))}
			</div>

			<Card className="overflow-hidden">
				<CardHeader>
					<CardTitle className="text-sm font-semibold">
						Rekap Per Karyawan
					</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow className="bg-muted/30">
								<TableHead className="text-xs">Karyawan</TableHead>
								<TableHead className="text-right text-xs">Bruto</TableHead>
								<TableHead className="text-right text-xs">PPh 21</TableHead>
								<TableHead className="text-center text-xs">TER</TableHead>
								<TableHead className="text-right text-xs">
									BPJS Karyawan
								</TableHead>
								<TableHead className="text-right text-xs">
									BPJS Perusahaan
								</TableHead>
								<TableHead className="text-right text-xs">Net Pay</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{items.map((item: TPayrollItem) => (
								<TableRow key={item.id}>
									<TableCell>
										<div className="text-xs font-semibold">
											{item.employeeName}
										</div>
										<div className="font-mono text-[10px] text-muted-foreground">
											{item.employeeCode} · {item.department}
										</div>
									</TableCell>
									<TableCell className="text-right font-mono text-xs">
										{formatRupiah(item.grossTotal)}
									</TableCell>
									<TableCell className="text-right font-mono text-xs">
										{formatRupiah(item.tax.pph21Monthly)}
									</TableCell>
									<TableCell className="text-center text-[10px] font-semibold">
										{item.tax.terCategory}
									</TableCell>
									<TableCell className="text-right font-mono text-xs">
										{formatRupiah(item.bpjs.totalEmployeeBpjs)}
									</TableCell>
									<TableCell className="text-right font-mono text-xs">
										{formatRupiah(item.bpjs.totalCompanyBpjs)}
									</TableCell>
									<TableCell className="text-right font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
										{formatRupiah(item.netPay)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
};

export const Route = createFileRoute(
	"/_authenticated/payroll/$periodId/report",
)({
	beforeLoad: checkRoutePermissions({
		permissions: [PERMISSION.PAYROLL_READ],
	}),
	loader: ({ context, params }) =>
		Promise.all([
			context.queryClient.ensureQueryData(
				payrollPeriodGetOptions(params.periodId),
			),
			context.queryClient.ensureQueryData(
				payrollReportItemsOptions(params.periodId),
			),
		]),
	component: PayrollReportPage,
});
