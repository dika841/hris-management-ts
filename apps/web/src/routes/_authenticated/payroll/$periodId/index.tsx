import { Guard } from "@app/components/guard/guard";
import { Badge } from "@app/components/ui/badge";
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
import type { TPayrollPeriodStatus } from "@app/schemas";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	CheckCircle2,
	Coins,
	FileText,
	Lock,
	Play,
	Wallet,
} from "lucide-react";
import type { FC, ReactElement } from "react";
import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import {
	payrollItemListOptions,
	payrollPeriodGetOptions,
	usePayrollCalculate,
	usePayrollItemList,
	usePayrollPeriodGet,
	usePayrollStatusUpdate,
} from "#/routes/_authenticated/payroll/_hooks/use-payroll.ts";

const PAGE_SIZE = 100;

const STATUS_CLASS: Record<TPayrollPeriodStatus, string> = {
	draft:
		"border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
	calculating:
		"border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
	approved:
		"border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
	paid: "border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
	locked:
		"border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-400",
};

const STATUS_LABEL: Record<TPayrollPeriodStatus, string> = {
	draft: "Draft",
	calculating: "Dihitung",
	approved: "Disetujui",
	paid: "Dibayar",
	locked: "Terkunci",
};

const PayrollPeriodDetailPage: FC = (): ReactElement => {
	const { periodId } = Route.useParams();
	const { data: period } = usePayrollPeriodGet(periodId);
	const { data: items } = usePayrollItemList({
		periodId,
		page: 1,
		pageSize: PAGE_SIZE,
	});
	const calculateMutation = usePayrollCalculate();
	const statusMutation = usePayrollStatusUpdate();

	const canCalculate =
		period.status === "draft" || period.status === "calculating";
	const canApprove =
		canCalculate && period.totalEmployees > 0 && !statusMutation.isPending;
	const canPay = period.status === "approved" && !statusMutation.isPending;
	const canLock = period.status === "paid" && !statusMutation.isPending;

	const updateStatus = (status: TPayrollPeriodStatus): void => {
		statusMutation.mutate({ id: period.id, status });
	};

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-col gap-2">
					<Button variant="ghost" size="sm" asChild className="w-fit -ml-2">
						<Link to="/payroll">
							<ArrowLeft className="size-3.5" />
							Daftar Periode Payroll
						</Link>
					</Button>
					<div className="flex items-center gap-2">
						<h1 className="text-xl font-bold tracking-tight">{period.name}</h1>
						<Badge
							variant="outline"
							className={`text-[10px] uppercase font-semibold ${STATUS_CLASS[period.status]}`}
						>
							{STATUS_LABEL[period.status]}
						</Badge>
					</div>
					<p className="text-xs text-muted-foreground">
						Cut-off {formatDate(period.startDate)} –{" "}
						{formatDate(period.endDate)}
						{" · "}Tanggal bayar {formatDate(period.payDate)}
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					{canCalculate && (
						<Guard permissions={[PERMISSION.PAYROLL_CALCULATE]}>
							<Button
								size="sm"
								variant="outline"
								onClick={() => calculateMutation.mutate({ periodId })}
								disabled={calculateMutation.isPending}
							>
								<Play className="size-3.5" />
								{calculateMutation.isPending ? "Menghitung..." : "Hitung Ulang"}
							</Button>
						</Guard>
					)}
					{canApprove && (
						<Guard permissions={[PERMISSION.PAYROLL_MANAGE]}>
							<Button
								size="sm"
								onClick={() => updateStatus("approved")}
								disabled={statusMutation.isPending}
							>
								<CheckCircle2 className="size-3.5" />
								Setujui
							</Button>
						</Guard>
					)}
					{canPay && (
						<Guard permissions={[PERMISSION.PAYROLL_MANAGE]}>
							<Button
								size="sm"
								onClick={() => updateStatus("paid")}
								disabled={statusMutation.isPending}
							>
								<Wallet className="size-3.5" />
								Tandai Dibayar
							</Button>
						</Guard>
					)}
					{canLock && (
						<Guard permissions={[PERMISSION.PAYROLL_MANAGE]}>
							<Button
								size="sm"
								onClick={() => updateStatus("locked")}
								disabled={statusMutation.isPending}
							>
								<Lock className="size-3.5" />
								Kunci Periode
							</Button>
						</Guard>
					)}
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-xs text-muted-foreground">
							Karyawan Diproses
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">{period.totalEmployees}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-xs text-muted-foreground">
							Total Bruto
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-lg font-bold">
							{formatRupiah(period.totalGross)}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-xs text-muted-foreground">
							PPh 21
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
							{formatRupiah(period.totalPph21)}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-xs text-muted-foreground">
							Total Gaji Bersih
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
							{formatRupiah(period.totalNetPay)}
						</p>
					</CardContent>
				</Card>
			</div>

			<Card className="overflow-hidden">
				<CardHeader className="flex flex-row items-center gap-2 pb-3">
					<Coins className="size-4 text-emerald-500" />
					<CardTitle className="text-sm font-semibold">
						Rincian Gaji Karyawan
					</CardTitle>
					<Badge variant="outline" className="ml-auto text-[10px]">
						{items.total} item
					</Badge>
				</CardHeader>
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow className="bg-muted/30">
								<TableHead className="text-xs">Karyawan</TableHead>
								<TableHead className="text-xs">Departemen</TableHead>
								<TableHead className="text-right text-xs">Gaji Pokok</TableHead>
								<TableHead className="text-right text-xs">Tunjangan</TableHead>
								<TableHead className="text-right text-xs">Lembur</TableHead>
								<TableHead className="text-right text-xs">Bruto</TableHead>
								<TableHead className="text-right text-xs">BPJS</TableHead>
								<TableHead className="text-right text-xs">PPh 21</TableHead>
								<TableHead className="text-right text-xs">Potongan</TableHead>
								<TableHead className="text-right text-xs">Take Home</TableHead>
								<TableHead className="text-center text-xs">Slip</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{items.items.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={11}
										className="py-10 text-center text-xs text-muted-foreground"
									>
										Belum ada item payroll. Jalankan perhitungan terlebih
										dahulu.
									</TableCell>
								</TableRow>
							) : (
								items.items.map((item) => (
									<TableRow key={item.id} className="hover:bg-muted/20">
										<TableCell>
											<div className="text-xs font-semibold">
												{item.employeeName}
											</div>
											<div className="font-mono text-[10px] text-muted-foreground">
												{item.employeeCode}
											</div>
										</TableCell>
										<TableCell>
											<div className="text-xs">{item.department}</div>
											<div className="text-[10px] text-muted-foreground">
												{item.position}
											</div>
										</TableCell>
										<TableCell className="text-right font-mono text-xs">
											{formatRupiah(item.basicSalary)}
										</TableCell>
										<TableCell className="text-right font-mono text-xs">
											{formatRupiah(item.allowanceTotal)}
										</TableCell>
										<TableCell className="text-right font-mono text-xs">
											{formatRupiah(item.overtimePay)}
										</TableCell>
										<TableCell className="text-right font-mono text-xs font-semibold">
											{formatRupiah(item.grossTotal)}
										</TableCell>
										<TableCell className="text-right font-mono text-xs">
											{formatRupiah(item.bpjs.totalEmployeeBpjs)}
										</TableCell>
										<TableCell className="text-right font-mono text-xs text-indigo-600 dark:text-indigo-400">
											{formatRupiah(item.tax.pph21Monthly)}
										</TableCell>
										<TableCell className="text-right font-mono text-xs">
											{formatRupiah(item.deductionTotal)}
										</TableCell>
										<TableCell className="text-right font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
											{formatRupiah(item.netPay)}
										</TableCell>
										<TableCell className="text-center">
											<Button
												variant="ghost"
												size="sm"
												className="size-8 p-0"
												title="Lihat rincian perhitungan"
												onClick={() => {
													if (item.calculationLog) {
														window.alert(item.calculationLog);
													}
												}}
											>
												<FileText className="size-3.5" />
											</Button>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
};

export const Route = createFileRoute("/_authenticated/payroll/$periodId/")({
	beforeLoad: checkRoutePermissions({
		permissions: [PERMISSION.PAYROLL_READ],
	}),
	loader: ({ context, params }) =>
		Promise.all([
			context.queryClient.ensureQueryData(
				payrollPeriodGetOptions(params.periodId),
			),
			context.queryClient.ensureQueryData(
				payrollItemListOptions({
					periodId: params.periodId,
					page: 1,
					pageSize: PAGE_SIZE,
				}),
			),
		]),
	component: PayrollPeriodDetailPage,
});
