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
import { formatRupiah } from "@app/format";
import { PTKP_CODE, type TPtkpCode, type TTaxMethod } from "@app/schemas";
import {
	Calculator,
	Check,
	Coins,
	FileText,
	Info,
	Sparkles,
} from "lucide-react";
import { useEffect, useState, type FC, type ReactElement } from "react";
import { useMutation } from "@tanstack/react-query";
import { orpc } from "#/libs/orpc/client.ts";

export const TaxSimulatorWidget: FC = (): ReactElement => {
	const [basicSalary, setBasicSalary] = useState<number>(10_000_000);
	const [allowances, setAllowances] = useState<number>(1_500_000);
	const [ptkpCode, setPtkpCode] = useState<TPtkpCode>(PTKP_CODE.TK_0);
	const [taxMethod, setTaxMethod] = useState<TTaxMethod>("gross");

	const simulateMutation = useMutation(orpc.payroll.simulate.mutationOptions());

	// Inisialisasi simulasi pertama kali atau saat form disubmit
	const runSimulation = () => {
		simulateMutation.mutate({
			basicSalary,
			allowances,
			ptkpCode,
			taxMethod,
			month: 1,
			overtimeHours: 0,
			bonus: 0,
			natura: 0,
			jkkRiskGrade: 1,
			ytdGrossJanToNov: 0,
			ytdPph21JanToNov: 0,
		});
	};

	useEffect(() => {
		runSimulation();
	}, []);

	const result = simulateMutation.data;

	return (
		<Card className="border border-border/60 bg-card overflow-hidden">
			<CardHeader className="bg-muted/30 pb-4 border-b border-border/40">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
					<div className="flex items-center gap-2">
						<div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
							<Calculator className="size-4.5" />
						</div>
						<div>
							<CardTitle className="text-base font-semibold">
								Live PPh 21 TER Simulator
							</CardTitle>
							<CardDescription className="text-xs">
								Regulasi Resmi PMK 168/2023 & BPJS Ketenagakerjaan / Kesehatan
							</CardDescription>
						</div>
					</div>
					<Badge
						variant="outline"
						className="self-start sm:self-auto gap-1 text-xs border border-border/60 bg-background"
					>
						<Sparkles className="size-3 text-amber-500" />
						Instant XAI Calculation
					</Badge>
				</div>
			</CardHeader>

			<CardContent className="p-5">
				<div className="grid gap-6 lg:grid-cols-12">
					{/* Sisi Kiri: Input Parameter */}
					<div className="flex flex-col gap-4 lg:col-span-5">
						<div className="space-y-1.5">
							<Label htmlFor="basic-salary" className="text-xs font-medium">
								Gaji Pokok Bulanan (IDR)
							</Label>
							<Input
								id="basic-salary"
								type="number"
								min={0}
								step={500_000}
								value={basicSalary}
								onChange={(e) => setBasicSalary(Number(e.target.value))}
								className="font-mono text-sm"
							/>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="allowances" className="text-xs font-medium">
								Tunjangan Tetap / Lainnya (IDR)
							</Label>
							<Input
								id="allowances"
								type="number"
								min={0}
								step={250_000}
								value={allowances}
								onChange={(e) => setAllowances(Number(e.target.value))}
								className="font-mono text-sm"
							/>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="ptkp-status" className="text-xs font-medium">
								Status PTKP Karyawan
							</Label>
							<div className="grid grid-cols-4 gap-1.5">
								{(
									[
										PTKP_CODE.TK_0,
										PTKP_CODE.TK_1,
										PTKP_CODE.K_0,
										PTKP_CODE.K_1,
										PTKP_CODE.TK_2,
										PTKP_CODE.K_2,
										PTKP_CODE.TK_3,
										PTKP_CODE.K_3,
									] as const
								).map((code) => (
									<button
										key={code}
										type="button"
										onClick={() => setPtkpCode(code)}
										className={`py-1.5 px-2 rounded-md text-xs font-medium border transition-colors ${
											ptkpCode === code
												? "bg-primary text-primary-foreground border-primary"
												: "bg-muted/40 text-muted-foreground border-border/60 hover:bg-muted"
										}`}
									>
										{code}
									</button>
								))}
							</div>
						</div>

						<div className="space-y-1.5">
							<Label className="text-xs font-medium">
								Metode Pemotongan Pajak
							</Label>
							<div className="grid grid-cols-3 gap-2">
								{(
									[
										{ id: "gross", label: "Gross", desc: "Karyawan bayar" },
										{
											id: "gross_up",
											label: "Gross-Up",
											desc: "Tunjangan pajak",
										},
										{ id: "nett", label: "Nett", desc: "Ditanggung PT" },
									] as const
								).map((method) => (
									<button
										key={method.id}
										type="button"
										onClick={() => setTaxMethod(method.id)}
										className={`p-2 rounded-lg text-left border transition-all ${
											taxMethod === method.id
												? "bg-primary/5 border-primary text-primary dark:bg-primary/10"
												: "bg-muted/20 border-border/60 text-muted-foreground hover:bg-muted/40"
										}`}
									>
										<div className="text-xs font-semibold">{method.label}</div>
										<div className="text-[10px] text-muted-foreground">
											{method.desc}
										</div>
									</button>
								))}
							</div>
						</div>

						<Button
							type="button"
							onClick={runSimulation}
							disabled={simulateMutation.isPending}
							className="mt-2 w-full gap-2 text-xs font-semibold"
						>
							<Coins className="size-4" />
							{simulateMutation.isPending
								? "Menghitung…"
								: "Kalkulasi Ulang Simulasi"}
						</Button>
					</div>

					{/* Sisi Kanan: Hasil & Rincian Transparansi */}
					<div className="flex flex-col justify-between rounded-xl border border-border/60 bg-muted/20 p-4 lg:col-span-7">
						<div>
							<div className="flex items-center justify-between pb-3 border-b border-border/40">
								<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
									Hasil Komputasi Penggajian
								</span>
								{result && (
									<Badge
										variant="outline"
										className="text-xs font-medium bg-background border-primary/40 text-primary"
									>
										{result.tax.terCategory} (Tarif{" "}
										{(result.tax.terRate * 100).toFixed(2)}%)
									</Badge>
								)}
							</div>

							{result ? (
								<div className="mt-4 space-y-3.5">
									{/* Take Home Pay Highlight */}
									<div className="p-3.5 rounded-lg bg-card border border-border/60 shadow-xs">
										<div className="flex items-center justify-between">
											<span className="text-xs text-muted-foreground font-medium">
												Gaji Bersih Diterima (Take Home Pay)
											</span>
											<span className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
												{formatRupiah(result.takeHomePay)}
											</span>
										</div>
										<div className="mt-1 text-[11px] text-muted-foreground flex justify-between">
											<span>
												Total Bruto Kas: {formatRupiah(result.grossTotal)}
											</span>
											<span>
												Potongan Karyawan:{" "}
												{formatRupiah(result.employeeDeductions)}
											</span>
										</div>
									</div>

									{/* Rincian Komponen Pajak & BPJS */}
									<div className="grid grid-cols-2 gap-2.5 text-xs">
										<div className="p-2.5 rounded-lg bg-card/60 border border-border/40">
											<div className="text-muted-foreground text-[11px]">
												PPh 21 Terutang
											</div>
											<div className="font-semibold text-foreground mt-0.5">
												{formatRupiah(result.tax.pph21Monthly)}
											</div>
											{result.taxAllowance > 0 && (
												<div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
													+ Tunj. Pajak: {formatRupiah(result.taxAllowance)}
												</div>
											)}
										</div>

										<div className="p-2.5 rounded-lg bg-card/60 border border-border/40">
											<div className="text-muted-foreground text-[11px]">
												BPJS Karyawan (1%+2%+1%)
											</div>
											<div className="font-semibold text-foreground mt-0.5">
												{formatRupiah(result.bpjs.totalEmployeeBpjs)}
											</div>
											<div className="text-[10px] text-muted-foreground mt-0.5">
												Kes: {formatRupiah(result.bpjs.kesehatanEmployee)} |
												JHT: {formatRupiah(result.bpjs.jhtEmployee)}
											</div>
										</div>

										<div className="p-2.5 rounded-lg bg-card/60 border border-border/40">
											<div className="text-muted-foreground text-[11px]">
												BPJS Perusahaan (Beban PT)
											</div>
											<div className="font-semibold text-foreground mt-0.5">
												{formatRupiah(result.bpjs.totalCompanyBpjs)}
											</div>
											<div className="text-[10px] text-muted-foreground mt-0.5">
												JKK: {formatRupiah(result.bpjs.jkkCompany)} | JKM:{" "}
												{formatRupiah(result.bpjs.jkmCompany)}
											</div>
										</div>

										<div className="p-2.5 rounded-lg bg-card/60 border border-border/40">
											<div className="text-muted-foreground text-[11px]">
												Kategori & Aturan
											</div>
											<div className="font-semibold text-foreground mt-0.5">
												{result.tax.ptkpCode} &rarr; {result.tax.terCategory}
											</div>
											<div className="text-[10px] text-muted-foreground mt-0.5">
												Metode: {result.tax.taxMethod.toUpperCase()}
											</div>
										</div>
									</div>

									{/* Catatan Explainable AI (XAI) */}
									<div className="p-3 rounded-lg bg-card border border-border/60 text-xs flex gap-2.5 items-start">
										<Info className="size-4 text-blue-500 shrink-0 mt-0.5" />
										<p className="text-muted-foreground leading-relaxed text-[11px]">
											<strong className="text-foreground">
												XAI Explanation:{" "}
											</strong>
											{result.explanation}
										</p>
									</div>
								</div>
							) : (
								<div className="py-12 flex flex-col items-center justify-center text-center">
									<div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
										<FileText className="size-5" />
									</div>
									<p className="text-xs text-muted-foreground max-w-xs mb-3">
										Klik tombol "Kalkulasi Ulang Simulasi" di sebelah kiri untuk
										melihat rincian kalkulasi instan.
									</p>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={runSimulation}
										className="text-xs gap-1.5"
									>
										<Sparkles className="size-3.5 text-amber-500" />
										Jalankan Simulasi Sekarang
									</Button>
								</div>
							)}
						</div>

						<div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
							<span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
								<Check className="size-3" /> Formula 100% Sesuai PMK 168/2023
							</span>
							<span>PP 58/2023 & PP 35/2021</span>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
