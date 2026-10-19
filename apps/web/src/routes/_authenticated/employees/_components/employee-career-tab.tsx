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
import { Textarea } from "@app/components/ui/textarea";
import { formatDate, formatRupiah } from "@app/format";
import {
	CAREER_CHANGE_TYPE,
	type TCareerChangeType,
	type TEmployee,
} from "@app/schemas";
import { History, Plus } from "lucide-react";
import { useState, type FC, type FormEvent, type ReactElement } from "react";
import {
	useCareerHistoryCreate,
	useCareerHistoryList,
} from "#/routes/_authenticated/employees/_hooks/use-employees.ts";

const CHANGE_LABEL: Record<TCareerChangeType, string> = {
	hire: "Pengangkatan",
	promotion: "Promosi",
	demotion: "Demosi",
	mutation: "Mutasi",
	salary_adjustment: "Penyesuaian Gaji",
};

type TProps = {
	employee: TEmployee;
};

export const EmployeeCareerTab: FC<TProps> = ({ employee }): ReactElement => {
	const { data: history } = useCareerHistoryList(employee.id);
	const createMutation = useCareerHistoryCreate();

	const [changeType, setChangeType] = useState<TCareerChangeType>(
		CAREER_CHANGE_TYPE.PROMOTION,
	);
	const [effectiveDate, setEffectiveDate] = useState(
		new Date().toISOString().split("T")[0] ?? "",
	);
	const [newDepartment, setNewDepartment] = useState(employee.department);
	const [newPosition, setNewPosition] = useState(employee.position);
	const [newSalary, setNewSalary] = useState(employee.basicSalary);
	const [notes, setNotes] = useState("");

	const handleSubmit = (event: FormEvent): void => {
		event.preventDefault();
		createMutation.mutate(
			{
				employeeId: employee.id,
				changeType,
				effectiveDate,
				newDepartment,
				newPosition,
				newSalary,
				notes: notes.trim() ? notes : undefined,
			},
			{
				onSuccess: () => {
					setNotes("");
				},
			},
		);
	};

	return (
		<div className="grid gap-6 lg:grid-cols-5">
			<Card className="lg:col-span-2">
				<CardHeader>
					<CardTitle className="text-sm font-semibold">
						Catat Perubahan Karier
					</CardTitle>
					<CardDescription className="text-xs">
						Promosi, mutasi, demosi, atau penyesuaian gaji akan memperbarui data
						karyawan sekaligus menyimpan riwayat.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="flex flex-col gap-3">
						<div className="space-y-1.5">
							<Label className="text-xs">Jenis Perubahan</Label>
							<Select
								value={changeType}
								onValueChange={(value) =>
									setChangeType(value as TCareerChangeType)
								}
							>
								<SelectTrigger className="text-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{Object.values(CAREER_CHANGE_TYPE).map((value) => (
										<SelectItem key={value} value={value}>
											{CHANGE_LABEL[value]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="effectiveDate" className="text-xs">
								Tanggal Efektif
							</Label>
							<Input
								id="effectiveDate"
								type="date"
								required
								value={effectiveDate}
								onChange={(e) => setEffectiveDate(e.target.value)}
								className="text-xs"
							/>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="newDepartment" className="text-xs">
								Departemen Baru
							</Label>
							<Input
								id="newDepartment"
								required
								value={newDepartment}
								onChange={(e) => setNewDepartment(e.target.value)}
								className="text-xs"
							/>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="newPosition" className="text-xs">
								Jabatan Baru
							</Label>
							<Input
								id="newPosition"
								required
								value={newPosition}
								onChange={(e) => setNewPosition(e.target.value)}
								className="text-xs"
							/>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="newSalary" className="text-xs">
								Gaji Pokok Baru (IDR)
							</Label>
							<Input
								id="newSalary"
								type="number"
								min={0}
								step={100_000}
								required
								value={newSalary}
								onChange={(e) => setNewSalary(Number(e.target.value))}
								className="font-mono text-xs"
							/>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="careerNotes" className="text-xs">
								Catatan
							</Label>
							<Textarea
								id="careerNotes"
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								placeholder="Dasar promosi, surat keputusan, atau alasan mutasi..."
								className="text-xs"
							/>
						</div>

						<Button
							type="submit"
							size="sm"
							disabled={createMutation.isPending}
							className="w-fit gap-1.5 text-xs"
						>
							<Plus className="size-3.5" />
							Simpan Perubahan
						</Button>
					</form>
				</CardContent>
			</Card>

			<Card className="lg:col-span-3">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-sm font-semibold">
						<History className="size-4 text-indigo-500" />
						Riwayat Karier
					</CardTitle>
					<CardDescription className="text-xs">
						{history.length} perubahan tercatat
					</CardDescription>
				</CardHeader>
				<CardContent>
					{history.length === 0 ? (
						<p className="rounded-lg border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground">
							Belum ada riwayat promosi, mutasi, atau penyesuaian gaji.
						</p>
					) : (
						<div className="relative flex flex-col gap-4 border-l border-border/60 pl-5">
							{history.map((entry) => (
								<div key={entry.id} className="relative space-y-1.5">
									<span className="absolute -left-[25px] top-1.5 size-2.5 rounded-full bg-primary ring-4 ring-background" />
									<div className="flex flex-wrap items-center gap-2">
										<Badge variant="outline" className="text-[10px]">
											{CHANGE_LABEL[entry.changeType]}
										</Badge>
										<span className="text-xs text-muted-foreground">
											{formatDate(entry.effectiveDate)}
										</span>
									</div>
									<div className="text-xs">
										<span className="font-medium">{entry.newPosition}</span>{" "}
										<span className="text-muted-foreground">
											({entry.newDepartment})
										</span>
									</div>
									<div className="text-[11px] text-muted-foreground">
										{entry.previousPosition ?? "-"} → {entry.newPosition}
										{" · "}
										{entry.previousSalary === null
											? "-"
											: formatRupiah(entry.previousSalary)}{" "}
										→ {formatRupiah(entry.newSalary)}
									</div>
									{entry.notes && (
										<p className="text-[11px] text-muted-foreground">
											{entry.notes}
										</p>
									)}
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};
