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
import { APP_MESSAGE } from "@app/messages";
import {
	EMPLOYMENT_STATUS,
	GENDER,
	PTKP_CODE,
	TAX_METHOD,
	type TEmploymentStatus,
	type TGender,
	type TPtkpCode,
	type TTaxMethod,
} from "@app/schemas";
import { Link, useNavigate } from "@tanstack/react-router";
import {
	Building2,
	CreditCard,
	FileText,
	Loader2,
	Scale,
	ShieldCheck,
	User,
} from "lucide-react";
import { useState, type FC, type FormEvent, type ReactElement } from "react";
import { useEmployeeCreate } from "#/routes/_authenticated/employees/_hooks/use-employees.ts";

export const EmployeeCreateForm: FC = (): ReactElement => {
	const navigate = useNavigate();
	const createMutation = useEmployeeCreate();

	// Primary identifiers
	const [employeeCode, setEmployeeCode] = useState("EMP-001");
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [idCardNumber, setIdCardNumber] = useState("3171010101900001");

	// Demographics & placement
	const [gender, setGender] = useState<TGender>(GENDER.MALE);
	const [dateOfBirth, setDateOfBirth] = useState("1995-05-15");
	const [department, setDepartment] = useState("Engineering");
	const [position, setPosition] = useState("Software Engineer");
	const [employmentStatus, setEmploymentStatus] = useState<TEmploymentStatus>(
		EMPLOYMENT_STATUS.PERMANENT,
	);
	const [joinDate, setJoinDate] = useState("2026-01-01");

	// Compensation & Tax (PMK 168/2023)
	const [basicSalary, setBasicSalary] = useState(12_000_000);
	const [ptkpCode, setPtkpCode] = useState<TPtkpCode>(PTKP_CODE.TK_0);
	const [taxMethod, setTaxMethod] = useState<TTaxMethod>(TAX_METHOD.GROSS);
	const [npwp, setNpwp] = useState("");

	// Banking & BPJS
	const [bankName, setBankName] = useState("Bank Central Asia (BCA)");
	const [bankAccountNumber, setBankAccountNumber] = useState("");
	const [bankAccountHolder, setBankAccountHolder] = useState("");
	const [bpjsKesehatanNumber, setBpjsKesehatanNumber] = useState("");
	const [bpjsKetenagakerjaanNumber, setBpjsKetenagakerjaanNumber] =
		useState("");

	// Privacy consent (UU PDP)
	const [pdpConsentGiven, setPdpConsentGiven] = useState(true);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		createMutation.mutate(
			{
				employeeCode,
				fullName,
				email,
				phone: phone.trim() ? phone : undefined,
				idCardNumber,
				gender,
				dateOfBirth,
				department,
				position,
				employmentStatus,
				joinDate,
				basicSalary,
				ptkpCode,
				taxMethod,
				npwp: npwp.trim() ? npwp : undefined,
				bankName: bankName.trim() ? bankName : undefined,
				bankAccountNumber: bankAccountNumber.trim()
					? bankAccountNumber
					: undefined,
				bankAccountHolder: bankAccountHolder.trim()
					? bankAccountHolder
					: undefined,
				bpjsKesehatanNumber: bpjsKesehatanNumber.trim()
					? bpjsKesehatanNumber
					: undefined,
				bpjsKetenagakerjaanNumber: bpjsKetenagakerjaanNumber.trim()
					? bpjsKetenagakerjaanNumber
					: undefined,
				jkkRiskGrade: 1,
				pdpConsentGiven,
			},
			{
				onSuccess: () => {
					void navigate({ to: "/employees" });
				},
			},
		);
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-6">
			{/* 1. Identitas & Kontak */}
			<Card className="border border-border/60 shadow-xs">
				<CardHeader className="pb-4">
					<div className="flex items-center gap-2">
						<div className="flex size-7 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
							<User className="size-4" />
						</div>
						<div>
							<CardTitle className="text-base font-semibold">
								1. Identitas &amp; Kontak Pegawai
							</CardTitle>
							<CardDescription className="text-xs">
								Data induk pribadi dan nomor identitas kependudukan (KTP)
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-1.5">
						<Label htmlFor="employeeCode" className="text-xs font-medium">
							Kode Karyawan / NIP <span className="text-destructive">*</span>
						</Label>
						<Input
							id="employeeCode"
							required
							value={employeeCode}
							onChange={(e) => setEmployeeCode(e.target.value)}
							placeholder="EMP-001"
							className="font-mono text-xs"
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="idCardNumber" className="text-xs font-medium">
							NIK (KTP 16 Digit) <span className="text-destructive">*</span>
						</Label>
						<Input
							id="idCardNumber"
							required
							minLength={16}
							maxLength={20}
							value={idCardNumber}
							onChange={(e) => setIdCardNumber(e.target.value)}
							placeholder="3171010101900001"
							className="font-mono text-xs"
						/>
					</div>

					<div className="space-y-1.5 sm:col-span-2">
						<Label htmlFor="fullName" className="text-xs font-medium">
							Nama Lengkap (Sesuai KTP){" "}
							<span className="text-destructive">*</span>
						</Label>
						<Input
							id="fullName"
							required
							value={fullName}
							onChange={(e) => setFullName(e.target.value)}
							placeholder="Budi Pratama"
							className="text-xs"
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="email" className="text-xs font-medium">
							Email Perusahaan / Kantor{" "}
							<span className="text-destructive">*</span>
						</Label>
						<Input
							id="email"
							required
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="budi.pratama@perusahaan.co.id"
							className="text-xs"
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="phone" className="text-xs font-medium">
							Nomor Telepon / WhatsApp
						</Label>
						<Input
							id="phone"
							type="tel"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							placeholder="081234567890"
							className="text-xs"
						/>
					</div>

					<div className="space-y-1.5">
						<Label className="text-xs font-medium">
							Jenis Kelamin <span className="text-destructive">*</span>
						</Label>
						<div className="grid grid-cols-2 gap-2">
							{([GENDER.MALE, GENDER.FEMALE] as const).map((g) => (
								<button
									key={g}
									type="button"
									onClick={() => setGender(g)}
									className={`h-9 rounded-md text-xs font-medium border transition-colors ${
										gender === g
											? "bg-primary text-primary-foreground border-primary"
											: "bg-muted/40 text-muted-foreground border-border/60 hover:bg-muted"
									}`}
								>
									{g === "male" ? "Laki-laki" : "Perempuan"}
								</button>
							))}
						</div>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="dateOfBirth" className="text-xs font-medium">
							Tanggal Lahir <span className="text-destructive">*</span>
						</Label>
						<Input
							id="dateOfBirth"
							required
							type="date"
							value={dateOfBirth}
							onChange={(e) => setDateOfBirth(e.target.value)}
							className="text-xs"
						/>
					</div>
				</CardContent>
			</Card>

			{/* 2. Penempatan & Hubungan Kerja */}
			<Card className="border border-border/60 shadow-xs">
				<CardHeader className="pb-4">
					<div className="flex items-center gap-2">
						<div className="flex size-7 items-center justify-center rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
							<Building2 className="size-4" />
						</div>
						<div>
							<CardTitle className="text-base font-semibold">
								2. Penempatan Organisasi &amp; Hubungan Kerja
							</CardTitle>
							<CardDescription className="text-xs">
								Departemen, peran jabatan, dan status kontrak kerja
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-1.5">
						<Label htmlFor="department" className="text-xs font-medium">
							Departemen / Divisi <span className="text-destructive">*</span>
						</Label>
						<Input
							id="department"
							required
							value={department}
							onChange={(e) => setDepartment(e.target.value)}
							placeholder="Engineering"
							className="text-xs"
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="position" className="text-xs font-medium">
							Jabatan / Posisi <span className="text-destructive">*</span>
						</Label>
						<Input
							id="position"
							required
							value={position}
							onChange={(e) => setPosition(e.target.value)}
							placeholder="Senior Software Engineer"
							className="text-xs"
						/>
					</div>

					<div className="space-y-1.5">
						<Label className="text-xs font-medium">
							Status Ketenagakerjaan <span className="text-destructive">*</span>
						</Label>
						<div className="grid grid-cols-2 gap-2">
							{(
								[
									{
										value: EMPLOYMENT_STATUS.PERMANENT,
										label: "Karyawan Tetap (PKWTT)",
									},
									{
										value: EMPLOYMENT_STATUS.CONTRACT,
										label: "Kontrak (PKWT)",
									},
								] as const
							).map((st) => (
								<button
									key={st.value}
									type="button"
									onClick={() => setEmploymentStatus(st.value)}
									className={`h-9 px-2 rounded-md text-xs font-medium border transition-colors ${
										employmentStatus === st.value
											? "bg-primary text-primary-foreground border-primary"
											: "bg-muted/40 text-muted-foreground border-border/60 hover:bg-muted"
									}`}
								>
									{st.label}
								</button>
							))}
						</div>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="joinDate" className="text-xs font-medium">
							Tanggal Mulai Bekerja <span className="text-destructive">*</span>
						</Label>
						<Input
							id="joinDate"
							required
							type="date"
							value={joinDate}
							onChange={(e) => setJoinDate(e.target.value)}
							className="text-xs"
						/>
					</div>
				</CardContent>
			</Card>

			{/* 3. Kompensasi & Pajak PPh 21 TER */}
			<Card className="border border-border/60 shadow-xs">
				<CardHeader className="pb-4">
					<div className="flex items-center gap-2">
						<div className="flex size-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
							<Scale className="size-4" />
						</div>
						<div>
							<CardTitle className="text-base font-semibold">
								3. Penggajian &amp; Skema Perpajakan (PMK 168/2023)
							</CardTitle>
							<CardDescription className="text-xs">
								Penentuan tarif efektif rata-rata (TER) dan metode pemotongan
								PPh 21
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-1.5 sm:col-span-2">
						<Label htmlFor="basicSalary" className="text-xs font-medium">
							Gaji Pokok Bulanan (IDR){" "}
							<span className="text-destructive">*</span>
						</Label>
						<Input
							id="basicSalary"
							required
							type="number"
							min={0}
							step={100000}
							value={basicSalary}
							onChange={(e) => setBasicSalary(Number(e.target.value))}
							className="font-mono text-sm"
						/>
					</div>

					<div className="space-y-1.5 sm:col-span-2">
						<Label className="text-xs font-medium">
							Golongan PTKP (Penghasilan Tidak Kena Pajak){" "}
							<span className="text-destructive">*</span>
						</Label>
						<div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
							{(
								[
									PTKP_CODE.TK_0,
									PTKP_CODE.TK_1,
									PTKP_CODE.TK_2,
									PTKP_CODE.TK_3,
									PTKP_CODE.K_0,
									PTKP_CODE.K_1,
									PTKP_CODE.K_2,
									PTKP_CODE.K_3,
								] as const
							).map((code) => (
								<button
									key={code}
									type="button"
									onClick={() => setPtkpCode(code)}
									className={`py-2 px-1 rounded-md text-xs font-mono font-medium border text-center transition-colors ${
										ptkpCode === code
											? "bg-primary text-primary-foreground border-primary"
											: "bg-muted/40 text-muted-foreground border-border/60 hover:bg-muted"
									}`}
								>
									{code}
								</button>
							))}
						</div>
						<p className="text-[11px] text-muted-foreground">
							TK = Tidak Kawin, K = Kawin, angka = jumlah tanggungan keluarga.
						</p>
					</div>

					<div className="space-y-1.5 sm:col-span-2">
						<Label className="text-xs font-medium">
							Metode Pemotongan Pajak{" "}
							<span className="text-destructive">*</span>
						</Label>
						<div className="grid grid-cols-3 gap-2">
							{(
								[
									{
										value: TAX_METHOD.GROSS,
										label: "Gross",
										desc: "Pajak ditanggung karyawan",
									},
									{
										value: TAX_METHOD.GROSS_UP,
										label: "Gross-Up",
										desc: "Tunjangan pajak penuh",
									},
									{
										value: TAX_METHOD.NETT,
										label: "Nett",
										desc: "Pajak ditanggung pemberi kerja",
									},
								] as const
							).map((m) => (
								<button
									key={m.value}
									type="button"
									onClick={() => setTaxMethod(m.value)}
									className={`p-2.5 rounded-lg text-left border transition-colors flex flex-col gap-0.5 ${
										taxMethod === m.value
											? "bg-primary/10 border-primary text-primary"
											: "bg-muted/30 border-border/60 hover:bg-muted text-foreground"
									}`}
								>
									<span className="text-xs font-semibold">{m.label}</span>
									<span className="text-[10px] text-muted-foreground">
										{m.desc}
									</span>
								</button>
							))}
						</div>
					</div>

					<div className="space-y-1.5 sm:col-span-2">
						<Label htmlFor="npwp" className="text-xs font-medium">
							Nomor Pokok Wajib Pajak (NPWP 16 Digit)
						</Label>
						<Input
							id="npwp"
							value={npwp}
							onChange={(e) => setNpwp(e.target.value)}
							placeholder="0123456789012345 (Opsional jika telah dipadankan NIK)"
							className="font-mono text-xs"
						/>
					</div>
				</CardContent>
			</Card>

			{/* 4. Rekening Bank & Jaminan Sosial BPJS */}
			<Card className="border border-border/60 shadow-xs">
				<CardHeader className="pb-4">
					<div className="flex items-center gap-2">
						<div className="flex size-7 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
							<CreditCard className="size-4" />
						</div>
						<div>
							<CardTitle className="text-base font-semibold">
								4. Rekening Bank Payroll &amp; Kepesertaan BPJS
							</CardTitle>
							<CardDescription className="text-xs">
								Kanal pencairan gaji dan jaminan sosial ketenagakerjaan /
								kesehatan
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-1.5">
						<Label htmlFor="bankName" className="text-xs font-medium">
							Nama Bank Penyalur
						</Label>
						<Input
							id="bankName"
							value={bankName}
							onChange={(e) => setBankName(e.target.value)}
							placeholder="Bank Mandiri / BCA / BNI / BRI"
							className="text-xs"
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="bankAccountNumber" className="text-xs font-medium">
							Nomor Rekening
						</Label>
						<Input
							id="bankAccountNumber"
							value={bankAccountNumber}
							onChange={(e) => setBankAccountNumber(e.target.value)}
							placeholder="1234567890"
							className="font-mono text-xs"
						/>
					</div>

					<div className="space-y-1.5 sm:col-span-2">
						<Label htmlFor="bankAccountHolder" className="text-xs font-medium">
							Nama Pemilik Rekening (Harus Sesuai Buku Tabungan)
						</Label>
						<Input
							id="bankAccountHolder"
							value={bankAccountHolder}
							onChange={(e) => setBankAccountHolder(e.target.value)}
							placeholder="Budi Pratama"
							className="text-xs"
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="bpjsKesehatan" className="text-xs font-medium">
							Nomor Kartu BPJS Kesehatan
						</Label>
						<Input
							id="bpjsKesehatan"
							value={bpjsKesehatanNumber}
							onChange={(e) => setBpjsKesehatanNumber(e.target.value)}
							placeholder="0001234567890"
							className="font-mono text-xs"
						/>
					</div>

					<div className="space-y-1.5">
						<Label
							htmlFor="bpjsKetenagakerjaan"
							className="text-xs font-medium"
						>
							Nomor KPJ BPJS Ketenagakerjaan
						</Label>
						<Input
							id="bpjsKetenagakerjaan"
							value={bpjsKetenagakerjaanNumber}
							onChange={(e) => setBpjsKetenagakerjaanNumber(e.target.value)}
							placeholder="12345678901"
							className="font-mono text-xs"
						/>
					</div>
				</CardContent>
			</Card>

			{/* 5. Tata Kelola Data Pribadi (UU PDP No. 27/2022) */}
			<Card className="border border-border/60 bg-muted/20 shadow-xs">
				<CardContent className="pt-6">
					<div className="flex items-start gap-3">
						<input
							id="pdp-consent"
							type="checkbox"
							checked={pdpConsentGiven}
							onChange={(e) => setPdpConsentGiven(e.target.checked)}
							className="mt-0.5 rounded border-border"
						/>
						<div className="space-y-1">
							<Label
								htmlFor="pdp-consent"
								className="text-xs font-semibold cursor-pointer flex items-center gap-1.5 text-foreground"
							>
								<ShieldCheck className="size-4 text-blue-500" />
								Persetujuan Pemrosesan Data Pribadi (UU PDP No. 27 Tahun 2022)
							</Label>
							<p className="text-xs text-muted-foreground leading-relaxed">
								Data pribadi karyawan yang dicatat diproses secara sah
								semata-mata untuk tujuan pelaksanaan hubungan kerja,
								administrasi perpajakan DJP (PMK 168/2023), dan jaminan sosial
								BPJS. Seluruh rekaman tersimpan terenkripsi dengan audit log
								transparan.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Form Footer Action */}
			<div className="flex items-center justify-end gap-3 pt-2">
				<Button variant="outline" asChild className="text-xs">
					<Link to="/employees">{APP_MESSAGE.CANCEL}</Link>
				</Button>
				<Button
					type="submit"
					disabled={createMutation.isPending}
					className="text-xs font-semibold gap-1.5 min-w-36"
				>
					{createMutation.isPending ? (
						<>
							<Loader2 className="size-3.5 animate-spin" />
							Menyimpan Data…
						</>
					) : (
						<>
							<FileText className="size-3.5" />
							Simpan Data Karyawan
						</>
					)}
				</Button>
			</div>
		</form>
	);
};
