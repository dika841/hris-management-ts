import type { TBpjsBreakdown } from "@app/schemas";

export const BPJS_CONFIG = {
	// Batas Atas Upah (Ceiling)
	KESEHATAN_MAX_WAGE: 12_000_000,
	JP_MAX_WAGE: 10_042_300,

	// Tarif BPJS Kesehatan
	KESEHATAN_COMPANY_RATE: 0.04, // 4%
	KESEHATAN_EMPLOYEE_RATE: 0.01, // 1%

	// Tarif BPJS Ketenagakerjaan
	JHT_COMPANY_RATE: 0.037, // 3.7%
	JHT_EMPLOYEE_RATE: 0.02, // 2.0%
	JKM_COMPANY_RATE: 0.003, // 0.3%
	JP_COMPANY_RATE: 0.02, // 2.0%
	JP_EMPLOYEE_RATE: 0.01, // 1.0%

	// Tarif JKK Berdasarkan Tingkat Risiko Lingkungan Kerja
	JKK_RATES_BY_GRADE: {
		1: 0.0024, // 0.24% - Sangat Rendah
		2: 0.0054, // 0.54% - Rendah
		3: 0.0089, // 0.89% - Sedang
		4: 0.0127, // 1.27% - Tinggi
		5: 0.0174, // 1.74% - Sangat Tinggi
	} as Record<number, number>,
} as const;

export type TBpjsCalculationInput = {
	readonly basicSalary: number;
	readonly fixedAllowances?: number;
	readonly jkkRiskGrade?: number;
};

export const calculateBpjsBreakdown = (
	input: TBpjsCalculationInput,
): TBpjsBreakdown => {
	const fixedWage = input.basicSalary + (input.fixedAllowances ?? 0);

	// Dasar upah dengan capping
	const kesehatanWageBasis = Math.min(
		fixedWage,
		BPJS_CONFIG.KESEHATAN_MAX_WAGE,
	);
	const jpWageBasis = Math.min(fixedWage, BPJS_CONFIG.JP_MAX_WAGE);

	// BPJS Kesehatan
	const kesehatanCompany = Math.round(
		kesehatanWageBasis * BPJS_CONFIG.KESEHATAN_COMPANY_RATE,
	);
	const kesehatanEmployee = Math.round(
		kesehatanWageBasis * BPJS_CONFIG.KESEHATAN_EMPLOYEE_RATE,
	);

	// BPJS Ketenagakerjaan
	const jhtCompany = Math.round(fixedWage * BPJS_CONFIG.JHT_COMPANY_RATE);
	const jhtEmployee = Math.round(fixedWage * BPJS_CONFIG.JHT_EMPLOYEE_RATE);

	const jkkRate =
		BPJS_CONFIG.JKK_RATES_BY_GRADE[input.jkkRiskGrade ?? 1] ?? 0.0024;
	const jkkCompany = Math.round(fixedWage * jkkRate);

	const jkmCompany = Math.round(fixedWage * BPJS_CONFIG.JKM_COMPANY_RATE);

	const jpCompany = Math.round(jpWageBasis * BPJS_CONFIG.JP_COMPANY_RATE);
	const jpEmployee = Math.round(jpWageBasis * BPJS_CONFIG.JP_EMPLOYEE_RATE);

	const totalCompanyBpjs =
		kesehatanCompany + jhtCompany + jkkCompany + jkmCompany + jpCompany;
	const totalEmployeeBpjs = kesehatanEmployee + jhtEmployee + jpEmployee;

	return {
		kesehatanCompany,
		kesehatanEmployee,
		jhtCompany,
		jhtEmployee,
		jkkCompany,
		jkmCompany,
		jpCompany,
		jpEmployee,
		totalCompanyBpjs,
		totalEmployeeBpjs,
	};
};
