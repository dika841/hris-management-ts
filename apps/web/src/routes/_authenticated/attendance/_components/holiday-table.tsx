import { Badge } from "@app/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@app/components/ui/table";
import type { TPublicHoliday } from "@app/schemas";
import { Calendar, Sparkles } from "lucide-react";
import type { FC, ReactElement } from "react";

type THolidayTableProps = {
	list: readonly TPublicHoliday[];
};

export const HolidayTable: FC<THolidayTableProps> = ({
	list,
}): ReactElement => {
	return (
		<div className="rounded-lg border border-border/60 bg-card overflow-hidden">
			<Table>
				<TableHeader>
					<TableRow className="border-b border-border/40 bg-muted/30">
						<TableHead className="text-xs font-semibold">Tanggal</TableHead>
						<TableHead className="text-xs font-semibold">
							Nama Hari Libur / Cuti Bersama
						</TableHead>
						<TableHead className="text-xs font-semibold">Kategori</TableHead>
						<TableHead className="text-xs font-semibold text-center">
							Tahun
						</TableHead>
						<TableHead className="text-xs font-semibold">
							Pengaruh Ke Payroll
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{list.length === 0 ? (
						<TableRow>
							<TableCell
								colSpan={5}
								className="py-10 text-center text-xs text-muted-foreground"
							>
								Belum ada kalender hari libur untuk tahun ini. Klik "Tambah Hari
								Libur" untuk mendaftarkan SKB 3 Menteri.
							</TableCell>
						</TableRow>
					) : (
						list.map((h: TPublicHoliday) => (
							<TableRow
								key={h.id}
								className="border-b border-border/30 hover:bg-muted/20"
							>
								<TableCell className="font-mono text-xs text-foreground font-semibold">
									<div className="flex items-center gap-1.5">
										<Calendar className="size-3.5 text-muted-foreground" />
										{h.date}
									</div>
								</TableCell>
								<TableCell className="text-xs font-medium text-foreground">
									{h.name}
								</TableCell>
								<TableCell>
									<Badge
										variant="outline"
										className={
											h.type === "national"
												? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px]"
												: "border-teal-500/30 bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px]"
										}
									>
										{h.type === "national" ? "Libur Nasional" : "Cuti Bersama"}
									</Badge>
								</TableCell>
								<TableCell className="text-center font-mono text-xs">
									{h.year}
								</TableCell>
								<TableCell className="text-xs text-muted-foreground">
									<span className="flex items-center gap-1">
										<Sparkles className="size-3 text-amber-500" />
										{h.type === "national"
											? "Pengali lembur libur 2x-4x (PP 35/2021)"
											: "Memotong hak cuti bersama / operasional kantor"}
									</span>
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	);
};
