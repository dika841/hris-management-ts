import { Guard } from "@app/components/guard/guard";
import { Badge } from "@app/components/ui/badge";
import { Button } from "@app/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@app/components/ui/card";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@app/components/ui/select";
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
import {
	PAYROLL_COMPONENT_TYPE,
	type TPayrollComponentType,
	type TPayrollPeriodStatus,
} from "@app/schemas";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	CheckCircle2,
	Coins,
	Download,
	Lock,
	Play,
	Plus,
	ReceiptText,
	BarChart3,
	Trash2,
	Wallet,
} from "lucide-react";
import { useState, type FC, type ReactElement } from "react";
import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import { orpc } from "#/libs/orpc/client.ts";
import { suspenseQueryOptionsFor } from "#/libs/orpc/procedure-query.ts";
import {
	payrollItemListOptions,
	payrollPeriodGetOptions,
	usePayrollBankExport,
	usePayrollCalculate,
	usePayrollComponentCreate,
	usePayrollComponentDelete,
	usePayrollComponentList,
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

const COMPONENT_LABEL: Record<TPayrollComponentType, string> = {
	allowance: "Tunjangan",
	bonus: "Bonus",
	natura: "Natura",
	deduction: "Potongan",
	thr: "THR",
	thirteenth_month: "Gaji ke-13",
};

const csvEscape = (value: string | number | null): string => {
	const text = value === null ? "" : String(value);
	return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
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
	const components = usePayrollComponentList(periodId);
	const createComponent = usePayrollComponentCreate();
	const deleteComponent = usePayrollComponentDelete();
	const employeesQuery = useSuspenseQuery(
		suspenseQueryOptionsFor(orpc.employee.list, { page: 1, pageSize: 100 }),
	);
	const employees = employeesQuery.data.items;
	const bankRows = usePayrollBankExport(periodId, true);

	const [componentEmployeeId, setComponentEmployeeId] = useState(
		employees[0]?.id ?? "",
	);
	const [componentType, setComponentType] = useState<TPayrollComponentType>(
		PAYROLL_COMPONENT_TYPE.ALLOWANCE,
	);
	const [componentAmount, setComponentAmount] = useState(0);
	const [componentNotes, setComponentNotes] = useState("");

	const canEditComponents =
		period.status === "draft" || period.status === "calculating";

	const submitComponent = (): void => {
		if (!componentEmployeeId || componentAmount <= 0) return;
		createComponent.mutate(
			{
				payrollPeriodId: period.id,
				employeeId: componentEmployeeId,
				type: componentType,
				amount: componentAmount,
				notes: componentNotes.trim() ? componentNotes : undefined,
			},
			{
				onSuccess: () => {
					setComponentAmount(0);
					setComponentNotes("");
				},
			},
		);
	};

	const downloadBankCsv = (): void => {
		const rows = bankRows.data ?? [];
		if (rows.length === 0) return;
		const header = [
			"Kode Karyawan",
			"Nama",
			"Bank",
			"No Rekening",
			"Atas Nama",
			"Net Pay",
		];
		const lines = [
			header.join(","),
			...rows.map((row) =>
				[
					row.employeeCode,
					row.employeeName,
					row.bankName,
					row.bankAccountNumber,
					row.bankAccountHolder,
					row.netPay,
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
		anchor.download = `transfer-bank-${period.name}.csv`;
		anchor.click();
		URL.revokeObjectURL(url);
	};

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
					<Guard permissions={[PERMISSION.PAYROLL_READ]}>
						<Button size="sm" variant="outline" asChild>
							<Link
								to="/payroll/$periodId/report"
								params={{ periodId: period.id }}
							>
								<BarChart3 className="size-3.5" />
								Laporan Payroll
							</Link>
						</Button>
						<Button
							size="sm"
							variant="outline"
							onClick={downloadBankCsv}
							disabled={(bankRows.data ?? []).length === 0}
						>
							<Download className="size-3.5" />
							Export Transfer Bank
						</Button>
					</Guard>
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

			<Card>
				<CardHeader>
					<CardTitle className="text-sm font-semibold">
						Komponen Gaji & Penyesuaian
					</CardTitle>
					<CardDescription className="text-xs">
						Tunjangan, bonus, natura, THR, gaji ke-13, dan potongan tambahan.
						Hitung ulang payroll setelah mengubah komponen.
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-6 lg:grid-cols-5">
					{canEditComponents && (
						<Guard permissions={[PERMISSION.PAYROLL_MANAGE]}>
							<div className="flex flex-col gap-3 lg:col-span-2">
								<div className="space-y-1.5">
									<Label className="text-xs">Karyawan</Label>
									<Select
										value={componentEmployeeId}
										onValueChange={setComponentEmployeeId}
									>
										<SelectTrigger className="text-xs">
											<SelectValue placeholder="Pilih karyawan" />
										</SelectTrigger>
										<SelectContent>
											{employees.map((employee) => (
												<SelectItem key={employee.id} value={employee.id}>
													{employee.fullName} ({employee.employeeCode})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="grid gap-3 sm:grid-cols-2">
									<div className="space-y-1.5">
										<Label className="text-xs">Jenis Komponen</Label>
										<Select
											value={componentType}
											onValueChange={(value) =>
												setComponentType(value as TPayrollComponentType)
											}
										>
											<SelectTrigger className="text-xs">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{Object.values(PAYROLL_COMPONENT_TYPE).map((value) => (
													<SelectItem key={value} value={value}>
														{COMPONENT_LABEL[value]}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-1.5">
										<Label htmlFor="componentAmount" className="text-xs">
											Nominal (IDR)
										</Label>
										<Input
											id="componentAmount"
											type="number"
											min={0}
											step={50_000}
											value={componentAmount}
											onChange={(e) =>
												setComponentAmount(Number(e.target.value))
											}
											className="font-mono text-xs"
										/>
									</div>
								</div>

								<div className="space-y-1.5">
									<Label htmlFor="componentNotes" className="text-xs">
										Catatan
									</Label>
									<Input
										id="componentNotes"
										value={componentNotes}
										onChange={(e) => setComponentNotes(e.target.value)}
										placeholder="Contoh: THR 2026, bonus kinerja..."
										className="text-xs"
									/>
								</div>

								<Button
									size="sm"
									onClick={submitComponent}
									disabled={createComponent.isPending || componentAmount <= 0}
									className="w-fit gap-1.5 text-xs"
								>
									<Plus className="size-3.5" />
									Tambah Komponen
								</Button>
							</div>
						</Guard>
					)}

					<div
						className={canEditComponents ? "lg:col-span-3" : "lg:col-span-5"}
					>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="text-xs">Karyawan</TableHead>
									<TableHead className="text-xs">Komponen</TableHead>
									<TableHead className="text-right text-xs">Nominal</TableHead>
									<TableHead className="text-xs">Catatan</TableHead>
									<TableHead className="w-12 text-right text-xs" />
								</TableRow>
							</TableHeader>
							<TableBody>
								{components.data.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={5}
											className="py-8 text-center text-xs text-muted-foreground"
										>
											Belum ada komponen tambahan untuk periode ini.
										</TableCell>
									</TableRow>
								) : (
									components.data.map((component) => (
										<TableRow key={component.id}>
											<TableCell className="text-xs">
												{employees.find(
													(employee) => employee.id === component.employeeId,
												)?.fullName ?? component.employeeId}
											</TableCell>
											<TableCell className="text-xs">
												{COMPONENT_LABEL[component.type]}
											</TableCell>
											<TableCell className="text-right font-mono text-xs">
												{formatRupiah(component.amount)}
											</TableCell>
											<TableCell className="text-xs text-muted-foreground">
												{component.notes ?? "-"}
											</TableCell>
											<TableCell className="text-right">
												{canEditComponents && (
													<Guard permissions={[PERMISSION.PAYROLL_MANAGE]}>
														<Button
															size="sm"
															variant="ghost"
															onClick={() =>
																deleteComponent.mutate({ id: component.id })
															}
															disabled={deleteComponent.isPending}
															className="size-7 p-0 text-muted-foreground hover:text-destructive"
															title="Hapus komponen"
														>
															<Trash2 className="size-3.5" />
														</Button>
													</Guard>
												)}
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

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
												asChild
												className="size-8 p-0"
												title="Buka slip gaji"
											>
												<Link
													to="/payroll/$periodId/payslip/$itemId"
													params={{
														periodId: period.id,
														itemId: item.id,
													}}
												>
													<ReceiptText className="size-3.5" />
												</Link>
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
