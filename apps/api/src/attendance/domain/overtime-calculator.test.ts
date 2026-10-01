import { OVERTIME_DAY_TYPE, WORK_SCHEDULE_TYPE } from "@app/schemas";
import { describe, expect, it } from "vitest";
import {
	calculateDurationMinutes,
	calculateHourlyRate,
	calculateMaternitySalarySchedule,
	calculateOvertimePay,
	calculateWorkingDays,
	getLongSickSalaryPercentage,
	isAnnualLeaveEligible,
	isCarryOverExpired,
} from "#/attendance/domain/overtime-calculator.ts";

describe("overtime-calculator (PP 35/2021 & UU KIA 2024)", () => {
	it("calculates hourly rate as 1/173 of monthly salary", () => {
		// Rp 10.000.000 / 173 = 57803.46 -> 57803
		expect(calculateHourlyRate(10_000_000)).toBe(57_803);
	});

	it("calculates duration minutes correctly across midnight", () => {
		expect(calculateDurationMinutes("17:00", "20:00")).toBe(180);
		expect(calculateDurationMinutes("23:00", "01:00")).toBe(120);
	});

	it("calculates workday overtime multipliers (1.5x 1st hour, 2.0x after)", () => {
		const hourlyRate = 50_000;
		// 3 jam lembur hari kerja = 1 jam * 1.5 + 2 jam * 2.0 = 1.5 * 50k + 2 * 2 * 50k = 75k + 200k = 275k
		const result = calculateOvertimePay(
			180,
			hourlyRate,
			OVERTIME_DAY_TYPE.WORKDAY,
			WORK_SCHEDULE_TYPE.FIVE_DAYS,
			0,
		);

		expect(result.totalAmount).toBe(275_000);
		expect(result.breakdown).toHaveLength(3);
		expect(result.breakdown[0]?.multiplier).toBe(1.5);
		expect(result.breakdown[1]?.multiplier).toBe(2.0);
		expect(result.breakdown[2]?.multiplier).toBe(2.0);
		expect(result.isOverDailyLimit).toBe(false);
		expect(result.isOverWeeklyLimit).toBe(false);
		expect(result.complianceWarnings).toHaveLength(0);
	});

	it("flags compliance violation if daily overtime exceeds 4 hours (PP 35/2021)", () => {
		const hourlyRate = 50_000;
		// 5 jam lembur
		const result = calculateOvertimePay(
			300,
			hourlyRate,
			OVERTIME_DAY_TYPE.WORKDAY,
			WORK_SCHEDULE_TYPE.FIVE_DAYS,
			0,
		);

		expect(result.isOverDailyLimit).toBe(true);
		expect(result.complianceWarnings[0]).toContain("4 jam/hari");
	});

	it("flags compliance violation if weekly overtime exceeds 18 hours (PP 35/2021)", () => {
		const hourlyRate = 50_000;
		// 3 jam, tapi akumulasi minggu sudah 16 jam (total 19 jam > 18 jam)
		const result = calculateOvertimePay(
			180,
			hourlyRate,
			OVERTIME_DAY_TYPE.WORKDAY,
			WORK_SCHEDULE_TYPE.FIVE_DAYS,
			16 * 60,
		);

		expect(result.isOverWeeklyLimit).toBe(true);
		expect(
			result.complianceWarnings.some((w) => w.includes("18 jam/minggu")),
		).toBe(true);
	});

	it("calculates weekly off overtime for 5-day schedule (1-8h: 2x, 9h: 3x, 10h+: 4x)", () => {
		const hourlyRate = 10_000;
		// 10 jam di hari libur 5 hari kerja
		// 8 jam * 2x * 10k = 160k
		// 1 jam ke-9 * 3x * 10k = 30k
		// 1 jam ke-10 * 4x * 10k = 40k
		// Total = 230k
		const result = calculateOvertimePay(
			600,
			hourlyRate,
			OVERTIME_DAY_TYPE.WEEKLY_OFF,
			WORK_SCHEDULE_TYPE.FIVE_DAYS,
			0,
		);

		expect(result.totalAmount).toBe(230_000);
		expect(result.breakdown[7]?.multiplier).toBe(2.0); // jam ke-8
		expect(result.breakdown[8]?.multiplier).toBe(3.0); // jam ke-9
		expect(result.breakdown[9]?.multiplier).toBe(4.0); // jam ke-10
	});

	it("calculates UU KIA 2024 maternity schedule", () => {
		const schedule = calculateMaternitySalarySchedule(6);
		expect(schedule).toHaveLength(6);
		expect(schedule[0]?.salaryPercentage).toBe(100);
		expect(schedule[1]?.salaryPercentage).toBe(100);
		expect(schedule[2]?.salaryPercentage).toBe(100);
		expect(schedule[3]?.salaryPercentage).toBe(75);
		expect(schedule[4]?.salaryPercentage).toBe(75);
		expect(schedule[5]?.salaryPercentage).toBe(75);
	});

	it("calculates long sick tier salary percentages (Pasal 93 UU 13/2003)", () => {
		expect(getLongSickSalaryPercentage(2)).toBe(100);
		expect(getLongSickSalaryPercentage(6)).toBe(75);
		expect(getLongSickSalaryPercentage(10)).toBe(50);
		expect(getLongSickSalaryPercentage(15)).toBe(25);
	});

	it("counts working days excluding weekends", () => {
		// 2026-06-01 (Senin) to 2026-06-05 (Jumat) = 5 days
		expect(calculateWorkingDays("2026-06-01", "2026-06-05")).toBe(5);
		// 2026-06-01 to 2026-06-07 (Senin to Minggu) = 5 working days
		expect(calculateWorkingDays("2026-06-01", "2026-06-07")).toBe(5);
	});

	it("checks annual leave eligibility (1 year rule)", () => {
		expect(isAnnualLeaveEligible("2025-01-01", "2025-12-31")).toBe(false);
		expect(isAnnualLeaveEligible("2025-01-01", "2026-01-01")).toBe(true);
	});

	it("checks carry-over expiration after June 30", () => {
		expect(isCarryOverExpired(new Date("2026-06-29"), 2026)).toBe(false);
		expect(isCarryOverExpired(new Date("2026-07-01"), 2026)).toBe(true);
	});
});
