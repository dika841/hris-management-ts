import { Badge } from "@app/components/ui/badge";
import { Button } from "@app/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@app/components/ui/card";
import { formatDate } from "@app/format";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import type { FC, ReactElement } from "react";
import { useExpiringContracts } from "#/routes/_authenticated/employees/_hooks/use-employees.ts";

export const ContractExpirationAlertCard: FC = (): ReactElement => {
	const { data: expiringContracts } = useExpiringContracts(30);

	return (
		<Card className="border-border/60">
			<CardHeader className="flex flex-row items-center justify-between pb-3">
				<div className="flex items-center gap-2">
					<AlertTriangle className="size-4 text-amber-500" />
					<CardTitle className="text-sm font-semibold">
						Peringatan Kontrak PKWT (30 Hari)
					</CardTitle>
				</div>
				<Badge
					variant={expiringContracts.length > 0 ? "destructive" : "outline"}
					className="text-[11px]"
				>
					{expiringContracts.length} Menjelang Berakhir
				</Badge>
			</CardHeader>
			<CardContent className="space-y-3">
				{expiringContracts.length === 0 ? (
					<div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-800 dark:text-emerald-300">
						<CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
						<span>
							Seluruh kontrak PKWT aktif aman. Tidak ada yang kedaluwarsa dalam
							30 hari ke depan.
						</span>
					</div>
				) : (
					<div className="space-y-2">
						{expiringContracts.slice(0, 4).map((contract) => (
							<div
								key={contract.id}
								className="flex items-center justify-between rounded-lg border border-border/50 bg-card p-2.5 text-xs hover:bg-muted/30 transition-colors"
							>
								<div className="space-y-0.5">
									<div className="font-semibold text-foreground flex items-center gap-2">
										<span className="font-mono text-[11px] text-muted-foreground">
											{contract.contractNumber}
										</span>
										<Badge variant="outline" className="text-[10px] uppercase">
											{contract.contractType}
										</Badge>
									</div>
									<div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
										<Clock className="size-3 text-amber-500" />
										<span>
											Berakhir{" "}
											{contract.endDate ? formatDate(contract.endDate) : "-"}
										</span>
										<span>•</span>
										<span>{contract.department}</span>
									</div>
								</div>
								<Button
									size="sm"
									variant="ghost"
									asChild
									className="size-8 p-0"
								>
									<Link
										to="/employees/$employeeId"
										params={{ employeeId: contract.employeeId }}
									>
										<ArrowRight className="size-3.5" />
									</Link>
								</Button>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
};
