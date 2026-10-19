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
import { Textarea } from "@app/components/ui/textarea";
import { PERMISSION } from "@app/permissions";
import {
	LEAVE_CATEGORY,
	type TLeaveCategory,
	type TLeaveType,
} from "@app/schemas";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Pencil, Plus, X } from "lucide-react";
import {
	useEffect,
	useState,
	type FC,
	type FormEvent,
	type ReactElement,
} from "react";
import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import { orpc } from "#/libs/orpc/client.ts";
import { suspenseQueryOptionsFor } from "#/libs/orpc/procedure-query.ts";
import {
	leaveTypeListOptions,
	useLeaveBalanceList,
	useLeaveBalanceUpsert,
	useLeaveTypeCreate,
	useLeaveTypeList,
	useLeaveTypeUpdate,
} from "#/routes/_authenticated/attendance/_hooks/use-attendance.ts";

const CURRENT_YEAR = new Date().getFullYear();
const PAGE_SIZE = 100;

const LEAVE_CATEGORY_LABEL: Record<TLeaveCategory, string> = {
	paid: "Berbayar",
	unpaid: "Tidak Berbayar",
	special_paid: "Berbayar Khusus",
};

const AttendanceSettingsPage: FC = (): ReactElement => {
	const leaveTypes = useLeaveTypeList();
	const createLeaveType = useLeaveTypeCreate();
	const updateLeaveType = useLeaveTypeUpdate();
	const upsertBalance = useLeaveBalanceUpsert();

	const employeesQuery = useSuspenseQuery(
		suspenseQueryOptionsFor(orpc.employee.list, {
			page: 1,
			pageSize: PAGE_SIZE,
		}),
	);
	const employees = employeesQuery.data.items;

	const [employeeId, setEmployeeId] = useState(employees[0]?.id ?? "");
	const [year, setYear] = useState(CURRENT_YEAR);
	const balances = useLeaveBalanceList({ employeeId, year });

	const [editingId, setEditingId] = useState<string | null>(null);
	const [code, setCode] = useState("");
	const [name, setName] = useState("");
	const [category, setCategory] = useState<TLeaveCategory>(LEAVE_CATEGORY.PAID);
	const [defaultDays, setDefaultDays] = useState(12);
	const [salaryPercentage, setSalaryPercentage] = useState(100);
	const [requiresDoctorNote, setRequiresDoctorNote] = useState(false);
	const [description, setDescription] = useState("");

	const [balanceTypeId, setBalanceTypeId] = useState(
		leaveTypes.data[0]?.id ?? "",
	);
	const [allocatedDays, setAllocatedDays] = useState(12);
	const [carryOverDays, setCarryOverDays] = useState(0);

	const selectedType = leaveTypes.data.find(
		(leaveType) => leaveType.id === balanceTypeId,
	);
	const selectedBalance = balances.data.find(
		(balance) => balance.leaveTypeId === balanceTypeId,
	);

	useEffect(() => {
		setAllocatedDays(
			selectedBalance?.allocatedDays ?? selectedType?.defaultDays ?? 0,
		);
		setCarryOverDays(selectedBalance?.carryOverDays ?? 0);
	}, [selectedBalance, selectedType]);

	const resetLeaveTypeForm = (): void => {
		setEditingId(null);
		setCode("");
		setName("");
		setCategory(LEAVE_CATEGORY.PAID);
		setDefaultDays(12);
		setSalaryPercentage(100);
		setRequiresDoctorNote(false);
		setDescription("");
	};

	const editLeaveType = (leaveType: TLeaveType): void => {
		setEditingId(leaveType.id);
		setCode(leaveType.code);
		setName(leaveType.name);
		setCategory(leaveType.category);
		setDefaultDays(leaveType.defaultDays);
		setSalaryPercentage(leaveType.salaryPercentage);
		setRequiresDoctorNote(leaveType.requiresDoctorNote);
		setDescription(leaveType.description ?? "");
	};

	const submitLeaveType = (event: FormEvent): void => {
		event.preventDefault();
		const payload = {
			code,
			name,
			category,
			defaultDays,
			salaryPercentage,
			requiresDoctorNote,
			description: description.trim() ? description : undefined,
		};

		if (editingId) {
			updateLeaveType.mutate(
				{ id: editingId, ...payload },
				{ onSuccess: resetLeaveTypeForm },
			);
			return;
		}

		createLeaveType.mutate(payload, { onSuccess: resetLeaveTypeForm });
	};

	const submitBalance = (event: FormEvent): void => {
		event.preventDefault();
		if (!balanceTypeId || !employeeId) return;
		upsertBalance.mutate({
			employeeId,
			leaveTypeId: balanceTypeId,
			year,
			allocatedDays,
			carryOverDays,
			usedDays: selectedBalance?.usedDays ?? 0,
			pendingDays: selectedBalance?.pendingDays ?? 0,
			forfeitedDays: selectedBalance?.forfeitedDays ?? 0,
		});
	};

	return (
		<div className="flex flex-col gap-6">
			<div className="border-b border-border/40 pb-4">
				<Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
					<Link to="/attendance">
						<ArrowLeft className="size-3.5" />
						Kembali ke Kehadiran
					</Link>
				</Button>
				<h1 className="mt-2 flex items-center gap-2 text-xl font-bold tracking-tight">
					<CalendarDays className="size-5 text-primary" />
					Pengaturan Cuti
				</h1>
				<p className="mt-1 text-xs text-muted-foreground">
					Kelola jenis cuti dan saldo cuti tahunan per karyawan.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-sm font-semibold">
						Jenis Cuti / Izin
					</CardTitle>
					<CardDescription className="text-xs">
						{leaveTypes.data.length} jenis cuti terdaftar
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-6 lg:grid-cols-5">
					<form
						onSubmit={submitLeaveType}
						className="flex flex-col gap-3 lg:col-span-2"
					>
						<div className="grid gap-3 sm:grid-cols-2">
							<div className="space-y-1.5">
								<Label htmlFor="leaveTypeCode" className="text-xs">
									Kode
								</Label>
								<Input
									id="leaveTypeCode"
									required
									value={code}
									onChange={(e) => setCode(e.target.value)}
									placeholder="annual"
									className="font-mono text-xs"
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="leaveTypeName" className="text-xs">
									Nama
								</Label>
								<Input
									id="leaveTypeName"
									required
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="Cuti Tahunan"
									className="text-xs"
								/>
							</div>
						</div>

						<div className="grid gap-3 sm:grid-cols-2">
							<div className="space-y-1.5">
								<Label className="text-xs">Kategori</Label>
								<Select
									value={category}
									onValueChange={(value) =>
										setCategory(value as TLeaveCategory)
									}
								>
									<SelectTrigger className="text-xs">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{Object.values(LEAVE_CATEGORY).map((value) => (
											<SelectItem key={value} value={value}>
												{LEAVE_CATEGORY_LABEL[value]}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="defaultDays" className="text-xs">
									Kuota Default (hari)
								</Label>
								<Input
									id="defaultDays"
									type="number"
									min={0}
									value={defaultDays}
									onChange={(e) => setDefaultDays(Number(e.target.value))}
									className="font-mono text-xs"
								/>
							</div>
						</div>

						<div className="grid gap-3 sm:grid-cols-2">
							<div className="space-y-1.5">
								<Label htmlFor="salaryPercentage" className="text-xs">
									Persentase Upah (%)
								</Label>
								<Input
									id="salaryPercentage"
									type="number"
									min={0}
									max={100}
									value={salaryPercentage}
									onChange={(e) => setSalaryPercentage(Number(e.target.value))}
									className="font-mono text-xs"
								/>
							</div>
							<label className="flex items-end gap-2 pb-2 text-xs">
								<input
									type="checkbox"
									checked={requiresDoctorNote}
									onChange={(e) => setRequiresDoctorNote(e.target.checked)}
								/>
								Wajib surat dokter
							</label>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="leaveTypeDescription" className="text-xs">
								Deskripsi
							</Label>
							<Textarea
								id="leaveTypeDescription"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className="text-xs"
							/>
						</div>

						<div className="flex items-center gap-2">
							<Button
								type="submit"
								size="sm"
								disabled={
									createLeaveType.isPending || updateLeaveType.isPending
								}
								className="w-fit gap-1.5 text-xs"
							>
								{editingId ? (
									<Pencil className="size-3.5" />
								) : (
									<Plus className="size-3.5" />
								)}
								{editingId ? "Simpan Perubahan" : "Tambah Jenis Cuti"}
							</Button>
							{editingId && (
								<Button
									type="button"
									size="sm"
									variant="ghost"
									onClick={resetLeaveTypeForm}
									className="gap-1.5 text-xs"
								>
									<X className="size-3.5" />
									Batal
								</Button>
							)}
						</div>
					</form>

					<div className="lg:col-span-3">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="text-xs">Kode</TableHead>
									<TableHead className="text-xs">Nama</TableHead>
									<TableHead className="text-xs">Kategori</TableHead>
									<TableHead className="text-center text-xs">Kuota</TableHead>
									<TableHead className="text-center text-xs">Upah</TableHead>
									<TableHead className="w-12 text-right text-xs" />
								</TableRow>
							</TableHeader>
							<TableBody>
								{leaveTypes.data.map((leaveType) => (
									<TableRow key={leaveType.id}>
										<TableCell className="font-mono text-xs">
											{leaveType.code}
										</TableCell>
										<TableCell className="text-xs">{leaveType.name}</TableCell>
										<TableCell className="text-[11px]">
											{LEAVE_CATEGORY_LABEL[leaveType.category]}
										</TableCell>
										<TableCell className="text-center font-mono text-xs">
											{leaveType.defaultDays}
										</TableCell>
										<TableCell className="text-center font-mono text-xs">
											{leaveType.salaryPercentage}%
										</TableCell>
										<TableCell className="text-right">
											<Button
												size="sm"
												variant="ghost"
												onClick={() => editLeaveType(leaveType)}
												className="size-7 p-0"
												title="Edit jenis cuti"
											>
												<Pencil className="size-3" />
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-sm font-semibold">Saldo Cuti</CardTitle>
					<CardDescription className="text-xs">
						Alokasi tahunan dan carry-over per karyawan
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-6 lg:grid-cols-5">
					<form
						onSubmit={submitBalance}
						className="flex flex-col gap-3 lg:col-span-2"
					>
						<div className="space-y-1.5">
							<Label className="text-xs">Karyawan</Label>
							<Select value={employeeId} onValueChange={setEmployeeId}>
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

						<div className="space-y-1.5">
							<Label htmlFor="balanceYear" className="text-xs">
								Tahun
							</Label>
							<Input
								id="balanceYear"
								type="number"
								min={2000}
								max={2100}
								value={year}
								onChange={(e) => setYear(Number(e.target.value))}
								className="font-mono text-xs"
							/>
						</div>

						<div className="space-y-1.5">
							<Label className="text-xs">Jenis Cuti</Label>
							<Select value={balanceTypeId} onValueChange={setBalanceTypeId}>
								<SelectTrigger className="text-xs">
									<SelectValue placeholder="Pilih jenis cuti" />
								</SelectTrigger>
								<SelectContent>
									{leaveTypes.data.map((leaveType) => (
										<SelectItem key={leaveType.id} value={leaveType.id}>
											{leaveType.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="grid gap-3 sm:grid-cols-2">
							<div className="space-y-1.5">
								<Label htmlFor="allocatedDays" className="text-xs">
									Alokasi
								</Label>
								<Input
									id="allocatedDays"
									type="number"
									min={0}
									value={allocatedDays}
									onChange={(e) => setAllocatedDays(Number(e.target.value))}
									className="font-mono text-xs"
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="carryOverDays" className="text-xs">
									Carry-over
								</Label>
								<Input
									id="carryOverDays"
									type="number"
									min={0}
									value={carryOverDays}
									onChange={(e) => setCarryOverDays(Number(e.target.value))}
									className="font-mono text-xs"
								/>
							</div>
						</div>

						<Button
							type="submit"
							size="sm"
							disabled={upsertBalance.isPending}
							className="w-fit gap-1.5 text-xs"
						>
							<Plus className="size-3.5" />
							Simpan Saldo Cuti
						</Button>
					</form>

					<div className="lg:col-span-3">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="text-xs">Jenis Cuti</TableHead>
									<TableHead className="text-center text-xs">Alokasi</TableHead>
									<TableHead className="text-center text-xs">Carry</TableHead>
									<TableHead className="text-center text-xs">
										Terpakai
									</TableHead>
									<TableHead className="text-center text-xs">Pending</TableHead>
									<TableHead className="text-center text-xs">Sisa</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{balances.data.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={6}
											className="py-8 text-center text-xs text-muted-foreground"
										>
											Belum ada saldo cuti untuk karyawan dan tahun ini.
										</TableCell>
									</TableRow>
								) : (
									balances.data.map((balance) => (
										<TableRow key={balance.id}>
											<TableCell className="text-xs">
												{leaveTypes.data.find(
													(leaveType) => leaveType.id === balance.leaveTypeId,
												)?.name ?? balance.leaveTypeId}
											</TableCell>
											<TableCell className="text-center font-mono text-xs">
												{balance.allocatedDays}
											</TableCell>
											<TableCell className="text-center font-mono text-xs">
												{balance.carryOverDays}
											</TableCell>
											<TableCell className="text-center font-mono text-xs">
												{balance.usedDays}
											</TableCell>
											<TableCell className="text-center font-mono text-xs">
												{balance.pendingDays}
											</TableCell>
											<TableCell className="text-center font-mono text-xs font-bold">
												{balance.remainingDays}
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export const Route = createFileRoute("/_authenticated/attendance/settings")({
	beforeLoad: checkRoutePermissions({
		permissions: [PERMISSION.LEAVE_MANAGE],
	}),
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(leaveTypeListOptions()),
	component: AttendanceSettingsPage,
});
