import { Button } from "@app/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@app/components/ui/card";
import { formatDate, formatRupiah } from "@app/format";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Printer } from "lucide-react";
import type { FC, ReactElement } from "react";
import { useSelfPayslipGet } from "#/routes/_authenticated/_hooks/use-self-service.ts";

const Row: FC<{ label: string; value: string }> = ({ label, value }) => (
	<div className="flex items-baseline justify-between gap-4 border-b border-border/30 py-1.5 text-xs last:border-0">
		<span className="text-muted-foreground">{label}</span>
		<span className="font-mono font-medium text-foreground">{value}</span>
	</div>
);

const MyPayslipPage: FC = (): ReactElement => {
	const { itemId } = Route.useParams();
	const query = useSelfPayslipGet(itemId);

	if (query.isPending) {
		return <p className="text-sm text-muted-foreground">Memuat slip gaji…</p>;
	}
	if (query.isError || !query.data) {
		return (
			<Card>
				<CardContent className="py-10 text-center text-sm text-muted-foreground">
					Slip gaji tidak ditemukan atau bukan milik akun Anda.
				</CardContent>
			</Card>
		);
	}

	const { period, item, components } = query.data;

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
				<div>
					<Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
						<Link to="/me">
							<ArrowLeft className="size-3.5" />
							Kembali ke Ruang Saya
						</Link>
					</Button>
					<h1 className="mt-1 text-xl font-bold tracking-tight">Slip Gaji</h1>
					<p className="text-xs text-muted-foreground">{period.name}</p>
				</div>
				<Button size="sm" onClick={() => window.print()}>
					<Printer className="size-3.5" />
					Cetak / Simpan PDF
				</Button>
			</div>

			<Card className="mx-auto w-full max-w-3xl print:max-w-none print:border-0 print:shadow-none">
				<CardHeader className="border-b border-border/40">
					<CardTitle className="text-lg font-bold">HRIS Management</CardTitle>
					<p className="text-xs text-muted-foreground">
						Slip Gaji Karyawan · {period.name} · {formatDate(period.payDate)}
					</p>
				</CardHeader>
				<CardContent className="space-y-6 pt-6">
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="text-xs">
							<div className="font-semibold">{item.employeeName}</div>
							<div className="font-mono text-muted-foreground">
								{item.employeeCode}
							</div>
							<div className="text-muted-foreground">
								{item.department} · {item.position}
							</div>
						</div>
						<div className="text-right text-xs text-muted-foreground">
							<div>
								Cut-off {period.startDate} – {period.endDate}
							</div>
							<div>Status: {period.status}</div>
						</div>
					</div>

					<div className="grid gap-6 md:grid-cols-2">
						<div>
							<h2 className="mb-2 text-sm font-semibold">Penghasilan</h2>
							<Row label="Gaji Pokok" value={formatRupiah(item.basicSalary)} />
							<Row
								label="Tunjangan"
								value={formatRupiah(item.allowanceTotal)}
							/>
							<Row label="Lembur" value={formatRupiah(item.overtimePay)} />
							<Row label="Bonus / THR" value={formatRupiah(item.bonusTotal)} />
							<Row label="Natura" value={formatRupiah(item.naturaTotal)} />
							<Row
								label="Tunjangan Pajak"
								value={formatRupiah(item.taxAllowance)}
							/>
							<div className="mt-2 flex justify-between border-t pt-2 text-sm font-semibold">
								<span>Total Bruto</span>
								<span className="font-mono">
									{formatRupiah(item.grossTotal)}
								</span>
							</div>
						</div>
						<div>
							<h2 className="mb-2 text-sm font-semibold">Potongan</h2>
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
							<div className="mt-2 flex justify-between border-t pt-2 text-sm font-semibold">
								<span>Total Potongan</span>
								<span className="font-mono">
									{formatRupiah(item.deductionTotal)}
								</span>
							</div>
							<div className="mt-4 flex justify-between rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-bold text-emerald-700 dark:text-emerald-300">
								<span>Take Home Pay</span>
								<span className="font-mono">{formatRupiah(item.netPay)}</span>
							</div>
						</div>
					</div>

					{components.length > 0 && (
						<div>
							<h2 className="mb-2 text-sm font-semibold">Komponen Tambahan</h2>
							{components.map((component) => (
								<Row
									key={component.id}
									label={`${component.type}${component.notes ? ` — ${component.notes}` : ""}`}
									value={formatRupiah(component.amount)}
								/>
							))}
						</div>
					)}

					{item.calculationLog && (
						<div className="rounded-lg border border-border/40 bg-muted/20 p-3 text-[11px] text-muted-foreground">
							{item.calculationLog}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export const Route = createFileRoute("/_authenticated/me/payslips/$itemId")({
	component: MyPayslipPage,
});
