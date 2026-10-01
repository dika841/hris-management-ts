/**
 * Helper & kalkulator kepatuhan hukum ketenagakerjaan PP No. 35 Tahun 2021
 * terkait Perjanjian Kerja Waktu Tertentu (PKWT) & Kompensasi Pengakhiran Kontrak.
 */

const DAYS_PER_MONTH = 30;
const MONTHS_PER_YEAR = 12;
const MAX_PKWT_YEARS = 5;

/**
 * Menghitung selisih masa kerja dalam hitungan bulan (dengan presisi desimal untuk sisa hari).
 */
export const calculateTenureMonths = (
	startDate: string,
	endDate: string,
): number => {
	const start = new Date(startDate);
	const end = new Date(endDate);
	const diffMs = end.getTime() - start.getTime();
	if (diffMs <= 0) return 0;

	const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
	return Number((diffDays / DAYS_PER_MONTH).toFixed(2));
};

/**
 * Menghitung Uang Kompensasi PKWT sesuai Pasal 15 s.d. 17 PP 35/2021:
 * - Masa kerja 1 bulan secara terus-menerus atau lebih berhak atas kompensasi.
 * - Rumus: (Masa Kerja dalam Bulan / 12) * Upah 1 Bulan (Gaji Pokok + Tunjangan Tetap)
 */
export const calculatePkwtCompensation = (
	startDate: string,
	endDate: string,
	monthlySalary: number,
): number => {
	const months = calculateTenureMonths(startDate, endDate);
	if (months < 1) {
		return 0; // Kurang dari 1 bulan tidak berhak atas uang kompensasi
	}

	const compensation = (months / MONTHS_PER_YEAR) * monthlySalary;
	return Math.round(compensation);
};

/**
 * Validasi apakah akumulasi durasi PKWT melebihi batas legal 5 tahun (Pasal 8 PP 35/2021).
 */
export const isPkwtOverMaxDuration = (totalMonths: number): boolean => {
	return totalMonths > MAX_PKWT_YEARS * MONTHS_PER_YEAR;
};
