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
import { PUBLIC_HOLIDAY_TYPE, type TPublicHolidayType } from "@app/schemas";
import { Link, useNavigate } from "@tanstack/react-router";
import { Calendar, Loader2, Plus } from "lucide-react";
import { useState, type FC, type FormEvent, type ReactElement } from "react";
import { usePublicHolidayCreate } from "#/routes/_authenticated/attendance/_hooks/use-attendance.ts";

export const HolidayCreateForm: FC = (): ReactElement => {
	const navigate = useNavigate();
	const createMutation = usePublicHolidayCreate();

	const [name, setName] = useState("Hari Raya Idul Fitri 1447 H");
	const [date, setDate] = useState("2026-03-20");
	const [type, setType] = useState<TPublicHolidayType>(
		PUBLIC_HOLIDAY_TYPE.NATIONAL,
	);
	const [description, setDescription] = useState("");

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		createMutation.mutate(
			{
				name,
				date,
				type,
				description: description || undefined,
			},
			{
				onSuccess: () => {
					void navigate({ to: "/attendance" });
				},
			},
		);
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-6">
			<Card className="border border-border/60 shadow-xs">
				<CardHeader className="pb-4">
					<div className="flex items-center gap-2">
						<div className="flex size-7 items-center justify-center rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400">
							<Calendar className="size-4" />
						</div>
						<div>
							<CardTitle className="text-base font-semibold">
								Informasi Hari Libur / Cuti Bersama
							</CardTitle>
							<CardDescription className="text-xs">
								Daftarkan hari libur resmi berdasarkan SKB 3 Menteri untuk
								kalender kerja perusahaan
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-1.5 sm:col-span-2">
						<Label htmlFor="holidayName" className="text-xs font-medium">
							Nama Hari Libur / Peringatan{" "}
							<span className="text-destructive">*</span>
						</Label>
						<Input
							id="holidayName"
							required
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Tahun Baru Masehi / Hari Raya Idul Fitri / Hari Buruh"
							className="text-xs"
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="holidayDate" className="text-xs font-medium">
							Tanggal Libur <span className="text-destructive">*</span>
						</Label>
						<Input
							id="holidayDate"
							type="date"
							required
							value={date}
							onChange={(e) => setDate(e.target.value)}
							className="text-xs font-mono"
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="holidayType" className="text-xs font-medium">
							Klasifikasi Hari Libur <span className="text-destructive">*</span>
						</Label>
						<Select
							value={type}
							onValueChange={(val) => setType(val as TPublicHolidayType)}
						>
							<SelectTrigger id="holidayType" className="text-xs">
								<SelectValue placeholder="Pilih tipe libur..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={PUBLIC_HOLIDAY_TYPE.NATIONAL}>
									Libur Nasional (Upah lembur dihitung 2x s/d 4x)
								</SelectItem>
								<SelectItem value={PUBLIC_HOLIDAY_TYPE.JOINT_LEAVE}>
									Cuti Bersama (Memotong kuota cuti bersama operasional)
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-1.5 sm:col-span-2">
						<Label htmlFor="description" className="text-xs font-medium">
							Deskripsi / Nomor SKB 3 Menteri
						</Label>
						<Input
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="SKB Menag, Menaker, MenPAN-RB No. ..."
							className="text-xs"
						/>
					</div>
				</CardContent>
			</Card>

			{/* Actions */}
			<div className="flex items-center justify-end gap-3 pt-2">
				<Button variant="outline" asChild className="text-xs">
					<Link to="/attendance">Batal</Link>
				</Button>
				<Button
					type="submit"
					disabled={createMutation.isPending}
					className="text-xs font-semibold gap-1.5 min-w-36"
				>
					{createMutation.isPending ? (
						<>
							<Loader2 className="size-3.5 animate-spin" />
							Menyimpan…
						</>
					) : (
						<>
							<Plus className="size-3.5" />
							Simpan Hari Libur
						</>
					)}
				</Button>
			</div>
		</form>
	);
};
