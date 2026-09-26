import { Card, CardContent, CardHeader, CardTitle } from "@app/components/ui/card";
import { formatDate, formatRupiah, orDash } from "@app/format";
import type { TEmployee } from "@app/schemas";
import { Building, CreditCard, HeartPulse, User } from "lucide-react";
import type { FC, ReactElement } from "react";
import { PdpConsentBadge, TaxMethodBadge } from "./employee-status-badge.tsx";

type TProps = {
	employee: TEmployee;
};

export const EmployeeProfileTab: FC<TProps> = ({ employee }): ReactElement => {
	return (
		<div className="grid gap-6 md:grid-cols-2">
			{/* Data Pribadi & Identitas */}
			<Card className="border-border/60">
				<CardHeader className="flex flex-row items-center gap-2.5 pb-3">
					<User className="size-4 text-primary" />
					<CardTitle className="text-sm font-semibold">Identitas & Informasi Pribadi</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3 text-xs">
					<div className="grid grid-cols-2 gap-2 border-b border-border/40 pb-2">
						<span className="text-muted-foreground">NIK (KTP)</span>
						<span className="font-mono font-semibold text-foreground">{employee.idCardNumber}</span>
					</div>
					<div className="grid grid-cols-2 gap-2 border-b border-border/40 pb-2">
						<span className="text-muted-foreground">Email</span>
						<span className="font-medium text-foreground">{employee.email}</span>
					</div>
					<div className="grid grid-cols-2 gap-2 border-b border-border/40 pb-2">
						<span className="text-muted-foreground">Nomor Telepon</span>
						<span className="text-foreground">{orDash(employee.phone)}</span>
					</div>
					<div className="grid grid-cols-2 gap-2 border-b border-border/40 pb-2">
						<span className="text-muted-foreground">Jenis Kelamin</span>
						<span className="text-foreground capitalize">{employee.gender === "male" ? "Laki-laki" : "Perempuan"}</span>
					</div>
					<div className="grid grid-cols-2 gap-2">
						<span className="text-muted-foreground">Tanggal Lahir</span>
						<span className="text-foreground">{formatDate(employee.dateOfBirth)}</span>
					</div>
				</CardContent>
			</Card>

			{/* Penempatan & Hubungan Kerja */}
			<Card className="border-border/60">
				<CardHeader className="flex flex-row items-center gap-2.5 pb-3">
					<Building className="size-4 text-primary" />
					<CardTitle className="text-sm font-semibold">Penempatan Kerja & Organisasi</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3 text-xs">
					<div className="grid grid-cols-2 gap-2 border-b border-border/40 pb-2">
						<span className="text-muted-foreground">Departemen</span>
						<span className="font-semibold text-foreground">{employee.department}</span>
					</div>
					<div className="grid grid-cols-2 gap-2 border-b border-border/40 pb-2">
						<span className="text-muted-foreground">Jabatan / Posisi</span>
						<span className="text-foreground">{employee.position}</span>
					</div>
					<div className="grid grid-cols-2 gap-2 border-b border-border/40 pb-2">
						<span className="text-muted-foreground">Tanggal Bergabung</span>
						<span className="text-foreground">{formatDate(employee.joinDate)}</span>
					</div>
					<div className="grid grid-cols-2 gap-2">
						<span className="text-muted-foreground">Tanggal Akhir Kontrak</span>
						<span className="font-mono text-foreground">{employee.endDate ? formatDate(employee.endDate) : "Tidak ada (Tetap)"}</span>
					</div>
				</CardContent>
			</Card>

			{/* Pajak & Penggajian */}
			<Card className="border-border/60">
				<CardHeader className="flex flex-row items-center gap-2.5 pb-3">
					<CreditCard className="size-4 text-primary" />
					<CardTitle className="text-sm font-semibold">Finansial & Perpajakan (PPh 21 TER)</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3 text-xs">
					<div className="grid grid-cols-2 gap-2 border-b border-border/40 pb-2">
						<span className="text-muted-foreground">Gaji Pokok Terakhir</span>
						<span className="font-mono font-bold text-foreground">{formatRupiah(employee.basicSalary)}</span>
					</div>
					<div className="grid grid-cols-2 gap-2 border-b border-border/40 pb-2">
						<span className="text-muted-foreground">Metode Pajak</span>
						<div><TaxMethodBadge method={employee.taxMethod} /></div>
					</div>
					<div className="grid grid-cols-2 gap-2 border-b border-border/40 pb-2">
						<span className="text-muted-foreground">Status Golongan PTKP</span>
						<span className="font-mono font-semibold text-foreground">{employee.ptkpCode}</span>
					</div>
					<div className="grid grid-cols-2 gap-2 border-b border-border/40 pb-2">
						<span className="text-muted-foreground">NPWP (16 Digit)</span>
						<span className="font-mono text-foreground">{orDash(employee.npwp)}</span>
					</div>
					<div className="grid grid-cols-2 gap-2">
						<span className="text-muted-foreground">Rekening Payroll</span>
						<span className="text-foreground font-mono">
							{employee.bankName ? `${employee.bankName} - ${employee.bankAccountNumber} (a.n ${employee.bankAccountHolder})` : "-"}
						</span>
					</div>
				</CardContent>
			</Card>

			{/* BPJS & Kepatuhan UU PDP */}
			<Card className="border-border/60">
				<CardHeader className="flex flex-row items-center gap-2.5 pb-3">
					<HeartPulse className="size-4 text-primary" />
					<CardTitle className="text-sm font-semibold">Jaminan Sosial & Privasi Data</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3 text-xs">
					<div className="grid grid-cols-2 gap-2 border-b border-border/40 pb-2">
						<span className="text-muted-foreground">BPJS Kesehatan</span>
						<span className="font-mono text-foreground">{orDash(employee.bpjsKesehatanNumber)}</span>
					</div>
					<div className="grid grid-cols-2 gap-2 border-b border-border/40 pb-2">
						<span className="text-muted-foreground">BPJS Ketenagakerjaan</span>
						<span className="font-mono text-foreground">{orDash(employee.bpjsKetenagakerjaanNumber)}</span>
					</div>
					<div className="grid grid-cols-2 gap-2 border-b border-border/40 pb-2">
						<span className="text-muted-foreground">Tingkat Risiko JKK</span>
						<span className="font-semibold text-foreground">Tingkat {employee.jkkRiskGrade}</span>
					</div>
					<div className="grid grid-cols-2 gap-2 items-center">
						<span className="text-muted-foreground">Persetujuan UU PDP No. 27/2022</span>
						<div><PdpConsentBadge consent={employee.pdpConsentGiven} /></div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
