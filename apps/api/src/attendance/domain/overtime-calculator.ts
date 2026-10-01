import type {
	TOvertimeCalculation,
	TOvertimeDayType,
	TWorkScheduleType,
} from "@app/schemas";
import { OVERTIME_DAY_TYPE, WORK_SCHEDULE_TYPE } from "@app/schemas";

/**
 * Menghitung upah lembur per jam sesuai PP 35/2021
 * Upah/jam = 1/173 × Upah Sebulan
 */
export const calculateHourlyRate = (monthlySalary: number): number =>
	Math.round(monthlySalary / 173);

/**
 * Menghitung total menit lembur dari string waktu HH:MM
 */
export const calculateDurationMinutes = (
	startTime: string,
	endTime: string,
): number => {
	const [startH, startM] = startTime.split(":").map(Number);
	const [endH, endM] = endTime.split(":").map(Number);
	const startTotal = (startH ?? 0) * 60 + (startM ?? 0);
	let endTotal = (endH ?? 0) * 60 + (endM ?? 0);
	// Jika melewati tengah malam
	if (endTotal <= startTotal) {
		endTotal += 24 * 60;
	}
	return endTotal - startTotal;
};

/**
 * Menghitung awal dan akhir minggu untuk cek batas 18 jam/minggu
 * Menggunakan Senin-Minggu sebagai standar pekan kerja
 */
export const getWeekBounds = (
	dateStr: string,
): { weekStart: string; weekEnd: string } => {
	const date = new Date(dateStr);
	const day = date.getDay(); // 0 = Minggu, 1 = Senin, ...
	const diff = day === 0 ? -6 : 1 - day; // Offset ke Senin
	const monday = new Date(date);
	monday.setDate(date.getDate() + diff);
	const sunday = new Date(monday);
	sunday.setDate(monday.getDate() + 6);

	const fmt = (d: Date): string => d.toISOString().split("T")[0] ?? "";
	return { weekStart: fmt(monday), weekEnd: fmt(sunday) };
};

type OvertimeHour = {
	hour: number;
	multiplier: number;
	amount: number;
	label: string;
};

/**
 * Kalkulasi lembur bertingkat sesuai PP 35/2021
 *
 * Hari Kerja (workday):
 *   - Jam ke-1: 1.5x upah/jam
 *   - Jam ke-2 dst: 2x upah/jam
 *
 * Hari Libur Mingguan (weekly_off) - 5 hari kerja:
 *   - Jam 1-8: 2x, jam ke-9: 3x, jam ke-10 dst: 4x
 *
 * Hari Libur Mingguan (weekly_off) - 6 hari kerja:
 *   - Jam 1-7: 2x, jam ke-8: 3x, jam ke-9 dst: 4x
 *
 * Hari Libur Nasional (national_holiday) - sama dengan hari libur mingguan
 */
export const calculateOvertimePay = (
	durationMinutes: number,
	hourlyRate: number,
	dayType: TOvertimeDayType,
	workScheduleType: TWorkScheduleType,
	weeklyAccumulatedMinutes: number,
): Omit<
	TOvertimeCalculation,
	"employeeId" | "overtimeDate" | "hourlyRate" | "dayType" | "workScheduleType"
> => {
	const durationHours = durationMinutes / 60;
	const newWeeklyTotal = weeklyAccumulatedMinutes + durationMinutes;

	const DAILY_LIMIT_MINUTES = 4 * 60; // 4 jam
	const WEEKLY_LIMIT_MINUTES = 18 * 60; // 18 jam

	const isOverDailyLimit = durationMinutes > DAILY_LIMIT_MINUTES;
	const isOverWeeklyLimit = newWeeklyTotal > WEEKLY_LIMIT_MINUTES;

	const complianceWarnings: string[] = [];
	if (isOverDailyLimit) {
		complianceWarnings.push(
			"Lembur melebihi batas 4 jam/hari (PP 35/2021 Pasal 26)",
		);
	}
	if (isOverWeeklyLimit) {
		complianceWarnings.push(
			"Lembur melebihi batas 18 jam/minggu (PP 35/2021 Pasal 26)",
		);
	}

	const breakdown: OvertimeHour[] = [];
	let totalAmount = 0;
	let remainingHours = durationHours;
	let currentHour = 1;

	if (dayType === OVERTIME_DAY_TYPE.WORKDAY) {
		// Hari Kerja: jam ke-1 = 1.5x, jam ke-2 dst = 2x
		while (remainingHours > 0) {
			const fraction = Math.min(1, remainingHours);
			const multiplier = currentHour === 1 ? 1.5 : 2.0;
			const amount = Math.round(multiplier * hourlyRate * fraction);
			breakdown.push({
				hour: currentHour,
				multiplier,
				amount,
				label:
					currentHour === 1
						? "Jam ke-1 (1.5×)"
						: `Jam ke-${currentHour} (2.0×)`,
			});
			totalAmount += amount;
			remainingHours -= fraction;
			currentHour++;
		}
	} else {
		// Hari Libur Mingguan atau Hari Libur Nasional
		// 5 hari kerja: 1-8 = 2x, ke-9 = 3x, ke-10+ = 4x
		// 6 hari kerja: 1-7 = 2x, ke-8 = 3x, ke-9+ = 4x
		const regularCap =
			workScheduleType === WORK_SCHEDULE_TYPE.FIVE_DAYS ? 8 : 7;
		const doubleCap = regularCap + 1;

		while (remainingHours > 0) {
			const fraction = Math.min(1, remainingHours);
			let multiplier: number;
			let label: string;

			if (currentHour <= regularCap) {
				multiplier = 2.0;
				label = `Jam ke-${currentHour} (2.0×)`;
			} else if (currentHour === doubleCap) {
				multiplier = 3.0;
				label = `Jam ke-${currentHour} (3.0×)`;
			} else {
				multiplier = 4.0;
				label = `Jam ke-${currentHour} (4.0×)`;
			}

			const amount = Math.round(multiplier * hourlyRate * fraction);
			breakdown.push({ hour: currentHour, multiplier, amount, label });
			totalAmount += amount;
			remainingHours -= fraction;
			currentHour++;
		}
	}

	return {
		durationMinutes,
		totalAmount,
		breakdown,
		isOverDailyLimit,
		isOverWeeklyLimit,
		weeklyAccumulatedMinutes: newWeeklyTotal,
		complianceWarnings,
	};
};

/**
 * Menghitung saldo cuti melahirkan sesuai UU KIA 2024 (UU No. 4/2024)
 *
 * - 3 bulan pertama: gaji 100%
 * - Dapat diperpanjang hingga bulan ke-4, ke-5, ke-6 dengan surat dokter:
 *   - Bulan ke-4, ke-5, ke-6: gaji 75%
 *
 * Returns: Array of monthly salary percentages
 */
export const calculateMaternitySalarySchedule = (
	totalMonths: number, // 3 - 6
): Array<{ month: number; salaryPercentage: number; note: string }> => {
	const schedule: Array<{
		month: number;
		salaryPercentage: number;
		note: string;
	}> = [];
	for (let i = 1; i <= totalMonths; i++) {
		if (i <= 3) {
			schedule.push({
				month: i,
				salaryPercentage: 100,
				note: "Gaji penuh (UU KIA 2024)",
			});
		} else {
			schedule.push({
				month: i,
				salaryPercentage: 75,
				note: "Perpanjangan cuti (75%) - Perlu rekomendasi dokter (UU KIA 2024)",
			});
		}
	}
	return schedule;
};

/**
 * Menghitung persentase gaji sakit berkepanjangan sesuai Pasal 93 UU 13/2003
 *
 * - 4 bulan pertama: 100%
 * - 4 bulan kedua: 75%
 * - 4 bulan ketiga: 50%
 * - Setelah itu: 25% (sampai proses PHK medis)
 */
export const getLongSickSalaryPercentage = (
	cumulativeSickMonths: number,
): number => {
	if (cumulativeSickMonths <= 4) return 100;
	if (cumulativeSickMonths <= 8) return 75;
	if (cumulativeSickMonths <= 12) return 50;
	return 25;
};

/**
 * Menghitung jumlah hari kerja antara dua tanggal
 * (tidak termasuk Sabtu, Minggu)
 */
export const calculateWorkingDays = (
	startDate: string,
	endDate: string,
): number => {
	const start = new Date(startDate);
	const end = new Date(endDate);
	let count = 0;
	const current = new Date(start);
	while (current <= end) {
		const dayOfWeek = current.getDay();
		if (dayOfWeek !== 0 && dayOfWeek !== 6) {
			count++;
		}
		current.setDate(current.getDate() + 1);
	}
	return count;
};

/**
 * Menghitung saldo cuti carry-over yang harus dihanguskan per 30 Juni
 * sesuai kebijakan carry-over 6 bulan
 */
export const isCarryOverExpired = (
	currentDate: Date,
	year: number,
): boolean => {
	const forfeitDate = new Date(`${year}-06-30`);
	return currentDate > forfeitDate;
};

/**
 * Mengecek apakah karyawan sudah memenuhi syarat hak cuti tahunan (1 tahun kerja)
 */
export const isAnnualLeaveEligible = (
	joinDate: string,
	checkDate: string,
): boolean => {
	const join = new Date(joinDate);
	const check = new Date(checkDate);
	const oneYearAfterJoin = new Date(join);
	oneYearAfterJoin.setFullYear(join.getFullYear() + 1);
	return check >= oneYearAfterJoin;
};
