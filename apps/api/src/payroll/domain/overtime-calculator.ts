export type TOvertimeCalculationInput = {
	readonly basicSalary: number;
	readonly fixedAllowances?: number;
	readonly weekdayOvertimeHours?: number;
	readonly holidayOvertimeHours?: number;
};

export type TOvertimeResult = {
	readonly hourlyRate: number;
	readonly weekdayOvertimePay: number;
	readonly holidayOvertimePay: number;
	readonly totalOvertimePay: number;
	readonly totalHours: number;
};

// Sesuai PP No. 35 Tahun 2021: upah sejam = 1/173 x Upah Sebulan
export const calculateHourlyRate = (
	basicSalary: number,
	fixedAllowances = 0,
): number => {
	const monthlyWage = basicSalary + fixedAllowances;
	return Math.round(monthlyWage / 173);
};

// Hitung Lembur Hari Kerja Biasa:
// Jam pertama = 1.5 x upah per jam
// Jam berikutnya = 2.0 x upah per jam
export const calculateWeekdayOvertimePay = (
	hourlyRate: number,
	hours: number,
): number => {
	if (hours <= 0) return 0;

	if (hours <= 1) {
		return Math.round(hours * 1.5 * hourlyRate);
	}

	const firstHourPay = 1.5 * hourlyRate;
	const remainingHours = hours - 1;
	const remainingHoursPay = remainingHours * 2.0 * hourlyRate;

	return Math.round(firstHourPay + remainingHoursPay);
};

// Hitung Lembur Hari Istirahat Mingguan / Hari Libur Resmi (skema 5 hari kerja):
// 8 jam pertama: 2 x upah per jam
// Jam ke-9: 3 x upah per jam
// Jam ke-10 s/d 12: 4 x upah per jam
export const calculateHolidayOvertimePay = (
	hourlyRate: number,
	hours: number,
): number => {
	if (hours <= 0) return 0;

	let totalPay = 0;
	let remaining = hours;

	const tier1Hours = Math.min(remaining, 8);
	totalPay += tier1Hours * 2.0 * hourlyRate;
	remaining -= tier1Hours;

	if (remaining > 0) {
		const tier2Hours = Math.min(remaining, 1);
		totalPay += tier2Hours * 3.0 * hourlyRate;
		remaining -= tier2Hours;
	}

	if (remaining > 0) {
		totalPay += remaining * 4.0 * hourlyRate;
	}

	return Math.round(totalPay);
};

export const calculateOvertime = (
	input: TOvertimeCalculationInput,
): TOvertimeResult => {
	const hourlyRate = calculateHourlyRate(
		input.basicSalary,
		input.fixedAllowances ?? 0,
	);
	const weekdayHours = input.weekdayOvertimeHours ?? 0;
	const holidayHours = input.holidayOvertimeHours ?? 0;

	const weekdayOvertimePay = calculateWeekdayOvertimePay(
		hourlyRate,
		weekdayHours,
	);
	const holidayOvertimePay = calculateHolidayOvertimePay(
		hourlyRate,
		holidayHours,
	);

	return {
		hourlyRate,
		weekdayOvertimePay,
		holidayOvertimePay,
		totalOvertimePay: weekdayOvertimePay + holidayOvertimePay,
		totalHours: weekdayHours + holidayHours,
	};
};
