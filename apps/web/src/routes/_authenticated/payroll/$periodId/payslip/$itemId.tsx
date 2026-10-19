import { Guard } from "@app/components/guard/guard";
import { Badge } from "@app/components/ui/badge";
import { Button } from "@app/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@app/components/ui/card";
import { formatDate, formatRupiah } from "@app/format";
import { PERMISSION } from "@app/permissions";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Mail, Printer } from "lucide-react";
import type { FC, ReactElement } from "react";
import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import {
	payrollPayslipOptions,
	usePayrollPayslip,
	usePayrollPayslipSend,
} from "#/routes/_authenticated/payroll/_hooks/use-payroll.ts";

const Row: FC<{ label: string; value: string }> = ({ label, value }) => (
	<div className="flex items-baseline justify-between gap-4 border-b border-border/30 py-1.5 text-xs last:border-0">
		<span className="text-muted-foreground">{label}</span>
		<span className="font-mono font-medium text-foreground">{value}</span>
	</div>
);

const PayslipPage: FC = (): ReactElement => {
	const { itemId } = Route.useParams();
	const { data: payslip } = usePayrollPayslip(itemId);
	const sendMutation = usePayrollPayslipSend();
	const { period, item, components } = payslip;

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
				<div className="flex flex-col gap-2">
					<Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
						<Link to="/payroll/$periodId" params={{ periodId: period.id }}>
							<ArrowLeft className="size-3.5" />
							Kembali ke Periode
						</Link>
					</Button>
					<h1 className="text-xl font-bold tracking-tight">Slip Gaji</h1>
					<p className="text-xs text-muted-foreground">
						{period.name} · {formatDate(period.payDate)}
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Guard permissions={[PERMISSION.PAYROLL_MANAGE]}>
						<Button
							size="sm"
							variant="outline"
							onClick={() => sendMutation.mutate({ id: item.id })}
							disabled={sendMutation.isPending}
						>
							<Mail className="size-3.5" />
							Kirim Email
						</Button>
					</Guard>
					<Button size="sm" onClick={() => window.print()}>
						<Printer className="size-3.5" />
						Cetak / Simpan PDF
					</Button>
				</div>
			</div>

			<Card className="mx-auto w-full max-w-3xl print:max-w-none print:border-0 print:shadow-none">
				<CardHeader className="border-b border-border/40">
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div>
							<CardTitle className="text-lg font-bold">
								HRIS Management
							</CardTitle>
							<p className="mt-1 text-xs text-muted-foreground">
								Slip Gaji Karyawan
							</p>
						</div>
						<Badge variant="outline" className="text-[10px] uppercase">
							{period.status}
						</Badge>
					</div>
				</CardHeader>
				<CardContent className="space-y-6 pt-6">
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-1 text-xs">
							<div className="font-semibold text-foreground">
								{item.employeeName}
							</div>
							<div className="font-mono text-muted-foreground">
								{item.employeeCode}
							</div>
							<div className="text-muted-foreground">
								{item.department} · {item.position}
							</div>
						</div>
						<div className="space-y-1 text-right text-xs">
							<div className="text-muted-foreground">Periode</div>
							<div className="font-medium">{period.name}</div>
							<div className="text-muted-foreground">
								Cut-off {period.startDate} – {period.endDate}
							</div>
							<div className="text-muted-foreground">
								Tanggal bayar {formatDate(period.payDate)}
							</div>
						</div>
					</div>

					<div className="grid gap-6 md:grid-cols-2">
						<div>
							<h2 className="mb-2 text-sm font-semibold text-foreground">
								Penghasilan
							</h2>
							<Row label="Gaji Pokok" value={formatRupiah(item.basicSalary)} />
							<Row
								label="Tunjangan"
								value={formatRupiah(item.allowanceTotal)}
							/>
							<Row label="Lembur" value={formatRupiah(item.overtimePay)} />
							<Row
								label="Bonus / THR / Gaji ke-13"
								value={formatRupiah(item.bonusTotal)}
							/>
							<Row label="Natura" value={formatRupiah(item.naturaTotal)} />
							<Row
								label="Tunjangan Pajak"
								value={formatRupiah(item.taxAllowance)}
							/>
							<div className="mt-2 flex items-baseline justify-between border-t border-border/60 pt-2 text-sm font-semibold">
								<span>Total Bruto</span>
								<span className="font-mono">
									{formatRupiah(item.grossTotal)}
								</span>
							</div>
						</div>

						<div>
							<h2 className="mb-2 text-sm font-semibold text-foreground">
								Potongan
							</h2>
							<Row
								label="BPJS Kesehatan"
								value={formatRupiah(item.bpjs.kesehatanEmployee)}
							/>
							<Row
								label="BPJS JHT"
								value={formatRupiah(item.bpjs.jhtEmployee)}
							/>
							<Row label="BPJS JP" value={formatRupiah(item.bpjs.jpEmployee)} />
							<Row label="PPh 21" value={formatRupiah(item.tax.pph21Monthly)} />
							<div className="mt-2 flex items-baseline justify-between border-t border-border/60 pt-2 text-sm font-semibold">
								<span>Total Potongan</span>
								<span className="font-mono">
									{formatRupiah(item.deductionTotal)}
								</span>
							</div>
							<div className="mt-4 flex items-baseline justify-between rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-bold text-emerald-700 dark:text-emerald-300">
								<span>Take Home Pay</span>
								<span className="font-mono">{formatRupiah(item.netPay)}</span>
							</div>
						</div>
					</div>

					{components.length > 0 && (
						<div>
							<h2 className="mb-2 text-sm font-semibold text-foreground">
								Komponen Tambahan
							</h2>
							{components.map((component) => (
								<Row
									key={component.id}
									label={`${component.type}${component.notes ? ` — ${component.notes}` : ""}`}
									value={formatRupiah(component.amount)}
								/>
							))}
						</div>
					)}

					<div className="rounded-lg border border-border/40 bg-muted/20 p-3 text-[11px] text-muted-foreground">
						<div className="font-semibold text-foreground">
							Rincian Perhitungan
						</div>
						<p className="mt-1 leading-relaxed">
							{item.calculationLog ??
								"Perhitungan mengikuti TER PPh 21, BPJS, dan komponen payroll periode ini."}
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export const Route = createFileRoute(
	"/_authenticated/payroll/$periodId/payslip/$itemId",
)({
	beforeLoad: checkRoutePermissions({
		permissions: [PERMISSION.PAYROLL_READ],
	}),
	loader: ({ context, params }) =>
		context.queryClient.ensureQueryData(payrollPayslipOptions(params.itemId)),
	component: PayslipPage,
});
