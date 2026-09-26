import { Badge } from "@app/components/ui/badge";
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
import type { TPayrollPeriod, TPayrollPeriodList } from "@app/schemas";
import { Calendar, Play } from "lucide-react";
import type { FC, ReactElement } from "react";
import { usePayrollCalculate } from "#/routes/_authenticated/payroll/_hooks/use-payroll.ts";

type TPayrollPeriodTableProps = {
	list: TPayrollPeriodList;
};

export const PayrollPeriodTable: FC<TPayrollPeriodTableProps> = ({
	list,
}): ReactElement => {
	const calculateMutation = usePayrollCalculate();

	const handleCalculate = (periodId: string) => {
		calculateMutation.mutate({ periodId });
	};

	return (
		<div className="rounded-lg border border-border/60 bg-card overflow-hidden">
			<Table>
				<TableHeader>
					<TableRow className="border-b border-border/40 bg-muted/30">
						<TableHead className="text-xs font-semibold">
							Nama Periode
						</TableHead>
						<TableHead className="text-xs font-semibold">
							Rentang Cut-Off
						</TableHead>
						<TableHead className="text-xs font-semibold">Tgl Gajian</TableHead>
						<TableHead className="text-xs font-semibold text-center">
							Karyawan
						</TableHead>
						<TableHead className="text-xs font-semibold text-right">
							Total Bruto
						</TableHead>
						<TableHead className="text-xs font-semibold text-right">
							PPh 21 TER
						</TableHead>
						<TableHead className="text-xs font-semibold text-right">
							Gaji Bersih (Net)
						</TableHead>
						<TableHead className="text-xs font-semibold text-center">
							Status
						</TableHead>
						<TableHead className="text-xs font-semibold text-right w-36">
							Aksi
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{list.items.length === 0 ? (
						<TableRow>
							<TableCell
								colSpan={9}
								className="py-8 text-center text-xs text-muted-foreground"
							>
								Belum ada siklus penggajian dibuat. Klik "Buka Siklus
								Penggajian" untuk memulai.
							</TableCell>
						</TableRow>
					) : (
						list.items.map((period: TPayrollPeriod) => (
							<TableRow
								key={period.id}
								className="border-b border-border/30 hover:bg-muted/20"
							>
								<TableCell>
									<div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
										<Calendar className="size-3.5 text-muted-foreground" />
										{period.name}
									</div>
									<div className="text-[10px] text-muted-foreground mt-0.5">
										Bulan {period.month} / {period.year}
									</div>
								</TableCell>
								<TableCell className="text-xs text-muted-foreground font-mono">
									{period.startDate} s/d {period.endDate}
								</TableCell>
								<TableCell className="text-xs text-foreground font-mono">
									{period.payDate}
								</TableCell>
								<TableCell className="text-center font-mono text-xs font-medium">
									{period.totalEmployees}
								</TableCell>
								<TableCell className="text-right font-mono text-xs font-semibold text-foreground">
									{period.totalGross > 0
										? formatRupiah(period.totalGross)
										: "-"}
								</TableCell>
								<TableCell className="text-right font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
									{period.totalPph21 > 0
										? formatRupiah(period.totalPph21)
										: "-"}
								</TableCell>
								<TableCell className="text-right font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
									{period.totalNetPay > 0
										? formatRupiah(period.totalNetPay)
										: "-"}
								</TableCell>
								<TableCell className="text-center">
									<Badge
										variant="outline"
										className={`text-[10px] uppercase font-semibold px-2 py-0.5 ${
											period.status === "approved" || period.status === "paid"
												? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
												: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
										}`}
									>
										{period.status}
									</Badge>
								</TableCell>
								<TableCell className="text-right">
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleCalculate(period.id)}
										disabled={calculateMutation.isPending}
										className="h-8 gap-1.5 text-xs font-medium border-border/60 hover:bg-primary hover:text-primary-foreground transition-colors"
									>
										<Play className="size-3 text-emerald-500 fill-emerald-500" />
										Hitung Payroll
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
