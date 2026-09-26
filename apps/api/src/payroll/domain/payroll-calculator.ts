import {
	TAX_METHOD,
	type TBpjsBreakdown,
	type TPtkpCode,
	type TTaxBreakdown,
	type TTaxMethod,
} from "@app/schemas";
import { calculateBpjsBreakdown } from "./bpjs-calculator.ts";
import {
	calculateArticle17ProgressiveTax,
	getPtkpValue,
	getTerCategory,
	getTerRate,
} from "./pph21-ter.ts";

export type TPayrollCalculationInput = {
	readonly basicSalary: number;
	readonly ptkpCode: TPtkpCode;
	readonly taxMethod: TTaxMethod;
	readonly allowances?: number;
	readonly overtimePay?: number;
	readonly bonus?: number;
	readonly natura?: number;
	readonly otherDeductions?: number;
	readonly jkkRiskGrade?: number;
	readonly month?: number; // 1-12, default 1
	readonly ytdContext?: {
		readonly ytdGrossJanToNov: number;
		readonly ytdPph21JanToNov: number;
		readonly ytdJhtEmployeeJanToNov?: number;
		readonly ytdJpEmployeeJanToNov?: number;
	};
};

export type TPayrollCalculationResult = {
	readonly basicSalary: number;
	readonly allowances: number;
	readonly overtimePay: number;
	readonly bonus: number;
	readonly natura: number;
	readonly taxAllowance: number;
	readonly cashGross: number;
	readonly totalTaxableGross: number;
	readonly bpjs: TBpjsBreakdown;
	readonly tax: TTaxBreakdown;
	readonly totalEmployeeDeductions: number;
	readonly netPay: number;
	readonly explanation: string;
};

// Hitung Tunjangan Pajak untuk Metode Gross-Up secara konvergen
export const calculateGrossUpAllowance = (
	baseTaxableGross: number,
	ptkpCode: TPtkpCode,
): { allowance: number; finalRate: number } => {
	const terCategory = getTerCategory(ptkpCode);
	let currentAllowance = Math.round(
		baseTaxableGross * getTerRate(terCategory, baseTaxableGross),
	);
	let finalRate = getTerRate(terCategory, baseTaxableGross);

	for (let i = 0; i < 15; i++) {
		const totalGross = baseTaxableGross + currentAllowance;
		const rate = getTerRate(terCategory, totalGross);
		const calculatedTax = Math.round(totalGross * rate);

		if (calculatedTax === currentAllowance) {
			finalRate = rate;
			break;
		}

		currentAllowance = calculatedTax;
		finalRate = rate;
	}

	return { allowance: currentAllowance, finalRate };
};

export const calculatePayroll = (
	input: TPayrollCalculationInput,
): TPayrollCalculationResult => {
	const basicSalary = Math.max(0, input.basicSalary);
	const allowances = Math.max(0, input.allowances ?? 0);
	const overtimePay = Math.max(0, input.overtimePay ?? 0);
	const bonus = Math.max(0, input.bonus ?? 0);
	const natura = Math.max(0, input.natura ?? 0);
	const otherDeductions = Math.max(0, input.otherDeductions ?? 0);
	const month = input.month ?? 1;
	const isDecember = month === 12;

	// 1. Hitung BPJS Ketenagakerjaan & Kesehatan
	const bpjs = calculateBpjsBreakdown({
		basicSalary,
		fixedAllowances: allowances,
		jkkRiskGrade: input.jkkRiskGrade ?? 1,
	});

	// Premi yang ditanggung pemberi kerja dan menjadi penambah bruto pajak karyawan:
	// - JKK Perusahaan
	// - JKM Perusahaan
	// - BPJS Kesehatan Perusahaan
	const companyPaidTaxableInsurance =
		bpjs.jkkCompany + bpjs.jkmCompany + bpjs.kesehatanCompany;

	// Total Penghasilan Bruto Dasar (sebelum tunjangan pajak gross-up)
	const baseTaxableGross =
		basicSalary +
		allowances +
		overtimePay +
		bonus +
		natura +
		companyPaidTaxableInsurance;

	const terCategory = getTerCategory(input.ptkpCode);

	let taxAllowance = 0;
	let pph21Monthly = 0;
	let terRate = 0;
	let taxableGrossMonthly = baseTaxableGross;
	let explanation = "";

	if (!isDecember) {
		// PERHITUNGAN BULANAN (JANUARI - NOVEMBER) MENGGUNAKAN TER PMK 168/2023
		if (input.taxMethod === TAX_METHOD.GROSS_UP) {
			const grossUpResult = calculateGrossUpAllowance(
				baseTaxableGross,
				input.ptkpCode,
			);
			taxAllowance = grossUpResult.allowance;
			terRate = grossUpResult.finalRate;
			taxableGrossMonthly = baseTaxableGross + taxAllowance;
			pph21Monthly = taxAllowance;
			explanation = `Bulan ${month}: Menggunakan TER ${terCategory} dengan metode Gross-Up. Tunjangan pajak sebesar Rp ${taxAllowance.toLocaleString("id-ID")} menutup PPh 21 (tarif ${(terRate * 100).toFixed(2)}%).`;
		} else if (input.taxMethod === TAX_METHOD.NETT) {
			terRate = getTerRate(terCategory, baseTaxableGross);
			pph21Monthly = Math.round(baseTaxableGross * terRate);
			taxAllowance = 0;
			explanation = `Bulan ${month}: Menggunakan TER ${terCategory} dengan metode Nett (PPh 21 sebesar Rp ${pph21Monthly.toLocaleString("id-ID")} ditanggung perusahaan).`;
		} else {
			// GROSS
			terRate = getTerRate(terCategory, baseTaxableGross);
			pph21Monthly = Math.round(baseTaxableGross * terRate);
			taxAllowance = 0;
			explanation = `Bulan ${month}: Menggunakan TER ${terCategory} tarif ${(terRate * 100).toFixed(2)}% atas bruto kena pajak Rp ${baseTaxableGross.toLocaleString("id-ID")}.`;
		}

		// Total potongan karyawan
		const isPphDeductedFromEmployee =
			input.taxMethod === TAX_METHOD.GROSS ||
			input.taxMethod === TAX_METHOD.GROSS_UP;

		const totalEmployeeDeductions =
			bpjs.totalEmployeeBpjs +
			otherDeductions +
			(isPphDeductedFromEmployee ? pph21Monthly : 0);

		const cashGross =
			basicSalary + allowances + overtimePay + bonus + taxAllowance;

		const netPay = cashGross - totalEmployeeDeductions;

		return {
			basicSalary,
			allowances,
			overtimePay,
			bonus,
			natura,
			taxAllowance,
			cashGross,
			totalTaxableGross: taxableGrossMonthly,
			bpjs,
			tax: {
				taxMethod: input.taxMethod,
				ptkpCode: input.ptkpCode,
				terCategory,
				terRate,
				isDecemberReconciliation: false,
				taxableGrossMonthly,
				taxAllowance,
				pph21Monthly,
			},
			totalEmployeeDeductions,
			netPay,
			explanation,
		};
	}

	// PERHITUNGAN MASA DESEMBER (REKONSILIASI TAHUNAN SESUAI PASAL 17 UU PPh & PMK 168/2023)
	const ytdGrossJanToNov = input.ytdContext?.ytdGrossJanToNov ?? 0;
	const ytdPph21JanToNov = input.ytdContext?.ytdPph21JanToNov ?? 0;
	const ytdJhtEmployee = input.ytdContext?.ytdJhtEmployeeJanToNov ?? 0;
	const ytdJpEmployee = input.ytdContext?.ytdJpEmployeeJanToNov ?? 0;

	const annualizedGross = ytdGrossJanToNov + baseTaxableGross;

	// Biaya Jabatan: 5% dari penghasilan bruto, maksimal Rp 6.000.000 setahun (Rp 500.000/bulan)
	const occupationalCost = Math.min(
		Math.round(annualizedGross * 0.05),
		6_000_000,
	);

	// Pengurang Iuran Pensiun / JHT Karyawan
	const annualPensionContributions =
		ytdJhtEmployee + ytdJpEmployee + bpjs.jhtEmployee + bpjs.jpEmployee;

	const annualNetIncome =
		annualizedGross - occupationalCost - annualPensionContributions;
	const annualPtkpValue = getPtkpValue(input.ptkpCode);

	// Penghasilan Kena Pajak (PKP) dibulatkan ke bawah ke ribuan penuh
	const taxableIncomeAnnual = Math.max(
		0,
		Math.floor((annualNetIncome - annualPtkpValue) / 1000) * 1000,
	);

	// Hitung PPh 21 Setahun Berdasarkan Tarif Progresif Pasal 17
	const annualPph21Calculated =
		calculateArticle17ProgressiveTax(taxableIncomeAnnual);

	// PPh 21 Desember = PPh 21 Setahun - PPh 21 yang telah dipotong Jan s/d Nov
	const rawDecemberPph21 = annualPph21Calculated - ytdPph21JanToNov;
	pph21Monthly = Math.max(0, rawDecemberPph21);

	explanation = `Bulan 12 (Rekonsiliasi Tahunan): PKP Setahun Rp ${taxableIncomeAnnual.toLocaleString("id-ID")}, PPh 21 Setahun Rp ${annualPph21Calculated.toLocaleString("id-ID")}, telah dipotong Jan-Nov Rp ${ytdPph21JanToNov.toLocaleString("id-ID")}, PPh 21 Masa Desember Rp ${pph21Monthly.toLocaleString("id-ID")}.`;

	const isPphDeductedFromEmployee = input.taxMethod !== TAX_METHOD.NETT;

	const totalEmployeeDeductions =
		bpjs.totalEmployeeBpjs +
		otherDeductions +
		(isPphDeductedFromEmployee ? pph21Monthly : 0);

	const cashGross = basicSalary + allowances + overtimePay + bonus;
	const netPay = cashGross - totalEmployeeDeductions;

	return {
		basicSalary,
		allowances,
		overtimePay,
		bonus,
		natura,
		taxAllowance: 0,
		cashGross,
		totalTaxableGross: baseTaxableGross,
		bpjs,
		tax: {
			taxMethod: input.taxMethod,
			ptkpCode: input.ptkpCode,
			terCategory: "PASAL_17",
			terRate: 0,
			isDecemberReconciliation: true,
			taxableGrossMonthly: baseTaxableGross,
			taxAllowance: 0,
			pph21Monthly,
			annualizedGross,
			occupationalCost,
			annualPensionContributions,
			annualPtkpValue,
			taxableIncomeAnnual,
			annualPph21Calculated,
			ytdPph21PaidJanToNov: ytdPph21JanToNov,
		},
		totalEmployeeDeductions,
		netPay,
		explanation,
	};
};
