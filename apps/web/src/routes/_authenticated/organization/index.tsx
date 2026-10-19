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
import { PERMISSION } from "@app/permissions";
import { createFileRoute } from "@tanstack/react-router";
import { Building2, Layers, Plus } from "lucide-react";
import { useState, type FC, type FormEvent, type ReactElement } from "react";
import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import {
	departmentListOptions,
	positionListOptions,
	useDepartmentCreate,
	useDepartmentList,
	usePositionCreate,
	usePositionList,
} from "#/routes/_authenticated/employees/_hooks/use-employees.ts";

const OrganizationPage: FC = (): ReactElement => {
	const departments = useDepartmentList();
	const positions = usePositionList();
	const createDepartment = useDepartmentCreate();
	const createPosition = usePositionCreate();

	const [departmentCode, setDepartmentCode] = useState("");
	const [departmentName, setDepartmentName] = useState("");
	const [departmentDescription, setDepartmentDescription] = useState("");

	const [positionCode, setPositionCode] = useState("");
	const [positionTitle, setPositionTitle] = useState("");
	const [positionDepartmentId, setPositionDepartmentId] = useState("none");

	const submitDepartment = (event: FormEvent): void => {
		event.preventDefault();
		createDepartment.mutate(
			{
				code: departmentCode,
				name: departmentName,
				description: departmentDescription.trim()
					? departmentDescription
					: undefined,
			},
			{
				onSuccess: () => {
					setDepartmentCode("");
					setDepartmentName("");
					setDepartmentDescription("");
				},
			},
		);
	};

	const submitPosition = (event: FormEvent): void => {
		event.preventDefault();
		createPosition.mutate(
			{
				code: positionCode,
				title: positionTitle,
				departmentId:
					positionDepartmentId === "none" ? undefined : positionDepartmentId,
			},
			{
				onSuccess: () => {
					setPositionCode("");
					setPositionTitle("");
					setPositionDepartmentId("none");
				},
			},
		);
	};

	return (
		<div className="flex flex-col gap-6">
			<div className="border-b border-border/40 pb-4">
				<div className="flex items-center gap-2">
					<div className="flex size-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
						<Building2 className="size-4.5" />
					</div>
					<h1 className="text-xl font-bold tracking-tight">
						Organisasi & Struktur Jabatan
					</h1>
				</div>
				<p className="mt-1 text-xs text-muted-foreground">
					Kelola master departemen dan posisi yang dipakai pada data karyawan
					dan payroll.
				</p>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-sm font-semibold">
							<Building2 className="size-4 text-blue-500" />
							Departemen
						</CardTitle>
						<CardDescription className="text-xs">
							{departments.data.length} departemen terdaftar
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col gap-4">
						<form
							onSubmit={submitDepartment}
							className="grid gap-3 rounded-lg border border-border/60 bg-muted/20 p-3 sm:grid-cols-2"
						>
							<div className="space-y-1">
								<Label htmlFor="departmentCode" className="text-xs">
									Kode
								</Label>
								<Input
									id="departmentCode"
									required
									value={departmentCode}
									onChange={(e) => setDepartmentCode(e.target.value)}
									placeholder="ENG"
									className="font-mono text-xs"
								/>
							</div>
							<div className="space-y-1">
								<Label htmlFor="departmentName" className="text-xs">
									Nama Departemen
								</Label>
								<Input
									id="departmentName"
									required
									value={departmentName}
									onChange={(e) => setDepartmentName(e.target.value)}
									placeholder="Engineering"
									className="text-xs"
								/>
							</div>
							<div className="space-y-1 sm:col-span-2">
								<Label htmlFor="departmentDescription" className="text-xs">
									Deskripsi
								</Label>
								<Input
									id="departmentDescription"
									value={departmentDescription}
									onChange={(e) => setDepartmentDescription(e.target.value)}
									placeholder="Product & engineering"
									className="text-xs"
								/>
							</div>
							<Button
								type="submit"
								size="sm"
								disabled={createDepartment.isPending}
								className="w-fit gap-1.5 text-xs sm:col-span-2"
							>
								<Plus className="size-3.5" />
								Tambah Departemen
							</Button>
						</form>

						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="text-xs">Kode</TableHead>
									<TableHead className="text-xs">Nama</TableHead>
									<TableHead className="text-xs">Deskripsi</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{departments.data.map((department) => (
									<TableRow key={department.id}>
										<TableCell className="font-mono text-xs font-semibold">
											{department.code}
										</TableCell>
										<TableCell className="text-xs">{department.name}</TableCell>
										<TableCell className="text-xs text-muted-foreground">
											{department.description ?? "-"}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-sm font-semibold">
							<Layers className="size-4 text-emerald-500" />
							Posisi / Jabatan
						</CardTitle>
						<CardDescription className="text-xs">
							{positions.data.length} posisi terdaftar
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col gap-4">
						<form
							onSubmit={submitPosition}
							className="grid gap-3 rounded-lg border border-border/60 bg-muted/20 p-3 sm:grid-cols-2"
						>
							<div className="space-y-1">
								<Label htmlFor="positionCode" className="text-xs">
									Kode
								</Label>
								<Input
									id="positionCode"
									required
									value={positionCode}
									onChange={(e) => setPositionCode(e.target.value)}
									placeholder="SE"
									className="font-mono text-xs"
								/>
							</div>
							<div className="space-y-1">
								<Label htmlFor="positionTitle" className="text-xs">
									Judul Posisi
								</Label>
								<Input
									id="positionTitle"
									required
									value={positionTitle}
									onChange={(e) => setPositionTitle(e.target.value)}
									placeholder="Software Engineer"
									className="text-xs"
								/>
							</div>
							<div className="space-y-1 sm:col-span-2">
								<Label htmlFor="positionDepartment" className="text-xs">
									Departemen
								</Label>
								<Select
									value={positionDepartmentId}
									onValueChange={setPositionDepartmentId}
								>
									<SelectTrigger id="positionDepartment" className="text-xs">
										<SelectValue placeholder="Pilih departemen" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">Tanpa departemen</SelectItem>
										{departments.data.map((department) => (
											<SelectItem key={department.id} value={department.id}>
												{department.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<Button
								type="submit"
								size="sm"
								disabled={createPosition.isPending}
								className="w-fit gap-1.5 text-xs sm:col-span-2"
							>
								<Plus className="size-3.5" />
								Tambah Posisi
							</Button>
						</form>

						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="text-xs">Kode</TableHead>
									<TableHead className="text-xs">Posisi</TableHead>
									<TableHead className="text-xs">Departemen</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{positions.data.map((position) => (
									<TableRow key={position.id}>
										<TableCell className="font-mono text-xs font-semibold">
											{position.code}
										</TableCell>
										<TableCell className="text-xs">{position.title}</TableCell>
										<TableCell>
											<Badge variant="outline" className="text-[10px]">
												{departments.data.find(
													(department) =>
														department.id === position.departmentId,
												)?.name ?? "-"}
											</Badge>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export const Route = createFileRoute("/_authenticated/organization/")({
	beforeLoad: checkRoutePermissions({
		permissions: [PERMISSION.EMPLOYEE_MANAGE],
	}),
	loader: ({ context }) =>
		Promise.all([
			context.queryClient.ensureQueryData(departmentListOptions()),
			context.queryClient.ensureQueryData(positionListOptions()),
		]),
	component: OrganizationPage,
});
