import {
	PTKP_CODE,
	TER_CATEGORY,
	type TPtkpCode,
	type TTerCategory,
} from "@app/schemas";

export type TTerBracket = {
	readonly maxGross: number; // nilai batas atas (inclusive)
	readonly rate: number; // tarif efektif, misal 0.05 untuk 5%
};

// Nilai PTKP Tahunan Resmi (PMK 101/PMK.010/2016 & PMK 168/2023)
export const PTKP_ANNUAL_VALUES: Record<TPtkpCode, number> = {
	[PTKP_CODE.TK_0]: 54_000_000,
	[PTKP_CODE.TK_1]: 58_500_000,
	[PTKP_CODE.TK_2]: 63_000_000,
	[PTKP_CODE.TK_3]: 67_500_000,
	[PTKP_CODE.K_0]: 58_500_000,
	[PTKP_CODE.K_1]: 63_000_000,
	[PTKP_CODE.K_2]: 67_500_000,
	[PTKP_CODE.K_3]: 72_000_000,
};

// Pemetaan Status PTKP ke Kategori Tarif Efektif Rata-Rata (TER) Bulanan
export const getTerCategory = (ptkpCode: TPtkpCode): TTerCategory => {
	switch (ptkpCode) {
		case PTKP_CODE.TK_0:
		case PTKP_CODE.TK_1:
		case PTKP_CODE.K_0:
			return TER_CATEGORY.A;
		case PTKP_CODE.TK_2:
		case PTKP_CODE.TK_3:
		case PTKP_CODE.K_1:
		case PTKP_CODE.K_2:
			return TER_CATEGORY.B;
		case PTKP_CODE.K_3:
			return TER_CATEGORY.C;
	}
};

export const getPtkpValue = (ptkpCode: TPtkpCode): number =>
	PTKP_ANNUAL_VALUES[ptkpCode] ?? 54_000_000;

// Tabel TER A Bulanan (PP 58/2023 Lampiran A)
export const TER_A_BRACKETS: readonly TTerBracket[] = [
	{ maxGross: 5_400_000, rate: 0 },
	{ maxGross: 5_650_000, rate: 0.0025 },
	{ maxGross: 5_950_000, rate: 0.005 },
	{ maxGross: 6_300_000, rate: 0.0075 },
	{ maxGross: 6_750_000, rate: 0.01 },
	{ maxGross: 7_500_000, rate: 0.0125 },
	{ maxGross: 8_550_000, rate: 0.015 },
	{ maxGross: 9_650_000, rate: 0.0175 },
	{ maxGross: 10_050_000, rate: 0.02 },
	{ maxGross: 10_350_000, rate: 0.0225 },
	{ maxGross: 10_700_000, rate: 0.025 },
	{ maxGross: 12_500_000, rate: 0.03 },
	{ maxGross: 13_750_000, rate: 0.04 },
	{ maxGross: 15_100_000, rate: 0.05 },
	{ maxGross: 16_950_000, rate: 0.06 },
	{ maxGross: 19_750_000, rate: 0.07 },
	{ maxGross: 24_100_000, rate: 0.08 },
	{ maxGross: 26_450_000, rate: 0.09 },
	{ maxGross: 28_000_000, rate: 0.1 },
	{ maxGross: 30_050_000, rate: 0.11 },
	{ maxGross: 32_400_000, rate: 0.12 },
	{ maxGross: 35_400_000, rate: 0.13 },
	{ maxGross: 39_100_000, rate: 0.14 },
	{ maxGross: 43_850_000, rate: 0.15 },
	{ maxGross: 47_800_000, rate: 0.16 },
	{ maxGross: 51_400_000, rate: 0.17 },
	{ maxGross: 56_300_000, rate: 0.18 },
	{ maxGross: 62_200_000, rate: 0.19 },
	{ maxGross: 68_600_000, rate: 0.2 },
	{ maxGross: 77_500_000, rate: 0.21 },
	{ maxGross: 89_000_000, rate: 0.22 },
	{ maxGross: 103_000_000, rate: 0.23 },
	{ maxGross: 125_000_000, rate: 0.24 },
	{ maxGross: 157_000_000, rate: 0.25 },
	{ maxGross: 206_000_000, rate: 0.26 },
	{ maxGross: 337_000_000, rate: 0.27 },
	{ maxGross: 454_000_000, rate: 0.28 },
	{ maxGross: 550_000_000, rate: 0.29 },
	{ maxGross: 695_000_000, rate: 0.3 },
	{ maxGross: 910_000_000, rate: 0.31 },
	{ maxGross: 1_400_000_000, rate: 0.32 },
	{ maxGross: Number.POSITIVE_INFINITY, rate: 0.34 },
];

// Tabel TER B Bulanan (PP 58/2023 Lampiran B)
export const TER_B_BRACKETS: readonly TTerBracket[] = [
	{ maxGross: 6_200_000, rate: 0 },
	{ maxGross: 6_500_000, rate: 0.0025 },
	{ maxGross: 6_850_000, rate: 0.005 },
	{ maxGross: 7_300_000, rate: 0.0075 },
	{ maxGross: 9_200_000, rate: 0.01 },
	{ maxGross: 10_750_000, rate: 0.015 },
	{ maxGross: 11_250_000, rate: 0.02 },
	{ maxGross: 11_600_000, rate: 0.025 },
	{ maxGross: 12_600_000, rate: 0.03 },
	{ maxGross: 13_600_000, rate: 0.04 },
	{ maxGross: 14_950_000, rate: 0.05 },
	{ maxGross: 16_400_000, rate: 0.06 },
	{ maxGross: 18_450_000, rate: 0.07 },
	{ maxGross: 21_850_000, rate: 0.08 },
	{ maxGross: 26_000_000, rate: 0.09 },
	{ maxGross: 27_700_000, rate: 0.1 },
	{ maxGross: 29_350_000, rate: 0.11 },
	{ maxGross: 31_450_000, rate: 0.12 },
	{ maxGross: 33_950_000, rate: 0.13 },
	{ maxGross: 37_100_000, rate: 0.14 },
	{ maxGross: 41_100_000, rate: 0.15 },
	{ maxGross: 45_800_000, rate: 0.16 },
	{ maxGross: 49_500_000, rate: 0.17 },
	{ maxGross: 53_800_000, rate: 0.18 },
	{ maxGross: 58_500_000, rate: 0.19 },
	{ maxGross: 64_000_000, rate: 0.2 },
	{ maxGross: 71_000_000, rate: 0.21 },
	{ maxGross: 80_000_000, rate: 0.22 },
	{ maxGross: 93_000_000, rate: 0.23 },
	{ maxGross: 109_000_000, rate: 0.24 },
	{ maxGross: 129_000_000, rate: 0.25 },
	{ maxGross: 163_000_000, rate: 0.26 },
	{ maxGross: 211_000_000, rate: 0.27 },
	{ maxGross: 374_000_000, rate: 0.28 },
	{ maxGross: 459_000_000, rate: 0.29 },
	{ maxGross: 555_000_000, rate: 0.3 },
	{ maxGross: 704_000_000, rate: 0.31 },
	{ maxGross: 957_000_000, rate: 0.32 },
	{ maxGross: 1_405_000_000, rate: 0.33 },
	{ maxGross: Number.POSITIVE_INFINITY, rate: 0.34 },
];

// Tabel TER C Bulanan (PP 58/2023 Lampiran C)
export const TER_C_BRACKETS: readonly TTerBracket[] = [
	{ maxGross: 6_600_000, rate: 0 },
	{ maxGross: 6_950_000, rate: 0.0025 },
	{ maxGross: 7_350_000, rate: 0.005 },
	{ maxGross: 7_800_000, rate: 0.0075 },
	{ maxGross: 8_850_000, rate: 0.01 },
	{ maxGross: 9_800_000, rate: 0.0125 },
	{ maxGross: 10_950_000, rate: 0.015 },
	{ maxGross: 11_200_000, rate: 0.0175 },
	{ maxGross: 12_050_000, rate: 0.02 },
	{ maxGross: 12_950_000, rate: 0.03 },
	{ maxGross: 14_150_000, rate: 0.04 },
	{ maxGross: 15_550_000, rate: 0.05 },
	{ maxGross: 17_050_000, rate: 0.06 },
	{ maxGross: 19_500_000, rate: 0.07 },
	{ maxGross: 22_700_000, rate: 0.08 },
	{ maxGross: 24_700_000, rate: 0.09 },
	{ maxGross: 26_450_000, rate: 0.1 },
	{ maxGross: 28_250_000, rate: 0.11 },
	{ maxGross: 30_050_000, rate: 0.12 },
	{ maxGross: 32_700_000, rate: 0.13 },
	{ maxGross: 36_050_000, rate: 0.14 },
	{ maxGross: 39_900_000, rate: 0.15 },
	{ maxGross: 43_850_000, rate: 0.16 },
	{ maxGross: 47_800_000, rate: 0.17 },
	{ maxGross: 51_400_000, rate: 0.18 },
	{ maxGross: 56_300_000, rate: 0.19 },
	{ maxGross: 62_200_000, rate: 0.2 },
	{ maxGross: 68_600_000, rate: 0.21 },
	{ maxGross: 77_500_000, rate: 0.22 },
	{ maxGross: 89_000_000, rate: 0.23 },
	{ maxGross: 103_000_000, rate: 0.24 },
	{ maxGross: 125_000_000, rate: 0.25 },
	{ maxGross: 157_000_000, rate: 0.26 },
	{ maxGross: 206_000_000, rate: 0.27 },
	{ maxGross: 337_000_000, rate: 0.28 },
	{ maxGross: 454_000_000, rate: 0.29 },
	{ maxGross: 550_000_000, rate: 0.3 },
	{ maxGross: 695_000_000, rate: 0.31 },
	{ maxGross: 910_000_000, rate: 0.32 },
	{ maxGross: 1_419_000_000, rate: 0.33 },
	{ maxGross: Number.POSITIVE_INFINITY, rate: 0.34 },
];

// Cari Tarif Efektif (TER) Bulanan
export const getTerRate = (
	category: TTerCategory,
	monthlyGross: number,
): number => {
	const brackets =
		category === TER_CATEGORY.A
			? TER_A_BRACKETS
			: category === TER_CATEGORY.B
				? TER_B_BRACKETS
				: TER_C_BRACKETS;

	for (const bracket of brackets) {
		if (monthlyGross <= bracket.maxGross) {
			return bracket.rate;
		}
	}
	return 0.34;
};

// Hitung Tarif Pajak Progresif Pasal 17 ayat (1) huruf a UU PPh (UU HPP No. 7/2021)
export const calculateArticle17ProgressiveTax = (
	taxableIncomeAnnual: number,
): number => {
	if (taxableIncomeAnnual <= 0) return 0;

	let remaining = taxableIncomeAnnual;
	let taxTotal = 0;

	// Lapisan 1: 0 s/d 60.000.000 (5%)
	const tier1 = Math.min(remaining, 60_000_000);
	taxTotal += tier1 * 0.05;
	remaining -= tier1;

	// Lapisan 2: > 60.000.000 s/d 250.000.000 (15%)
	if (remaining > 0) {
		const tier2 = Math.min(remaining, 190_000_000); // 250jt - 60jt
		taxTotal += tier2 * 0.15;
		remaining -= tier2;
	}

	// Lapisan 3: > 250.000.000 s/d 500.000.000 (25%)
	if (remaining > 0) {
		const tier3 = Math.min(remaining, 250_000_000); // 500jt - 250jt
		taxTotal += tier3 * 0.25;
		remaining -= tier3;
	}

	// Lapisan 4: > 500.000.000 s/d 5.000.000.000 (30%)
	if (remaining > 0) {
		const tier4 = Math.min(remaining, 4_500_000_000); // 5M - 500jt
		taxTotal += tier4 * 0.3;
		remaining -= tier4;
	}

	// Lapisan 5: > 5.000.000.000 (35%)
	if (remaining > 0) {
		taxTotal += remaining * 0.35;
	}

	return Math.round(taxTotal);
};
