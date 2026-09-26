import { describe, expect, it } from "vitest";
import { calculateBpjsBreakdown } from "./bpjs-calculator.ts";
import { calculateOvertime } from "./overtime-calculator.ts";
import { calculatePayroll } from "./payroll-calculator.ts";
import {
	calculateArticle17ProgressiveTax,
	getPtkpValue,
	getTerCategory,
	getTerRate,
} from "./pph21-ter.ts";

describe("PPh 21 TER Engine (PMK 168/2023 & PP 58/2023)", () => {
	it("correctly maps PTKP status to TER categories", () => {
		expect(getTerCategory("TK/0")).toBe("TER_A");
		expect(getTerCategory("TK/1")).toBe("TER_A");
		expect(getTerCategory("K/0")).toBe("TER_A");

		expect(getTerCategory("TK/2")).toBe("TER_B");
		expect(getTerCategory("TK/3")).toBe("TER_B");
		expect(getTerCategory("K/1")).toBe("TER_B");
		expect(getTerCategory("K/2")).toBe("TER_B");

		expect(getTerCategory("K/3")).toBe("TER_C");
	});

	it("returns official PTKP values", () => {
		expect(getPtkpValue("TK/0")).toBe(54_000_000);
		expect(getPtkpValue("K/0")).toBe(58_500_000);
		expect(getPtkpValue("K/1")).toBe(63_000_000);
		expect(getPtkpValue("K/3")).toBe(72_000_000);
	});

	it("correctly determines monthly TER rates", () => {
		// TER A: <= 5.400.000 is 0%
		expect(getTerRate("TER_A", 5_000_000)).toBe(0);
		// TER A: 9.650.001 - 10.050.000 is 2%
		expect(getTerRate("TER_A", 10_000_000)).toBe(0.02);
		// TER A: 13.750.001 - 15.100.000 is 5%
		expect(getTerRate("TER_A", 15_000_000)).toBe(0.05);

		// TER B: <= 6.200.000 is 0%
		expect(getTerRate("TER_B", 6_000_000)).toBe(0);
		// TER B: 10.750.001 - 11.250.000 is 2%
		expect(getTerRate("TER_B", 11_000_000)).toBe(0.02);

		// TER C: <= 6.600.000 is 0%
		expect(getTerRate("TER_C", 6_500_000)).toBe(0);
	});

	it("calculates progressive Article 17 tax correctly", () => {
		// Tier 1 only (<= 60.000.000 at 5%)
		expect(calculateArticle17ProgressiveTax(50_000_000)).toBe(2_500_000);

		// Tier 1 + Tier 2 (100.000.000: 60jt * 5% + 40jt * 15% = 3jt + 6jt = 9jt)
		expect(calculateArticle17ProgressiveTax(100_000_000)).toBe(9_000_000);

		// 300.000.000: 60jt*5% (3jt) + 190jt*15% (28.5jt) + 50jt*25% (12.5jt) = 44jt
		expect(calculateArticle17ProgressiveTax(300_000_000)).toBe(44_000_000);
	});
});

describe("BPJS Calculator", () => {
	it("calculates BPJS components with wage capping", () => {
		const bpjs = calculateBpjsBreakdown({
			basicSalary: 10_000_000,
			jkkRiskGrade: 1, // 0.24%
		});

		expect(bpjs.kesehatanCompany).toBe(400_000); // 4% of 10jt
		expect(bpjs.kesehatanEmployee).toBe(100_000); // 1% of 10jt
		expect(bpjs.jhtCompany).toBe(370_000); // 3.7% of 10jt
		expect(bpjs.jhtEmployee).toBe(200_000); // 2% of 10jt
		expect(bpjs.jkkCompany).toBe(24_000); // 0.24% of 10jt
		expect(bpjs.jkmCompany).toBe(30_000); // 0.3% of 10jt
		expect(bpjs.jpCompany).toBe(200_000); // 2% of 10jt
		expect(bpjs.jpEmployee).toBe(100_000); // 1% of 10jt
	});

	it("applies ceiling cap for high salaries", () => {
		const bpjs = calculateBpjsBreakdown({
			basicSalary: 25_000_000,
		});

		// Kesehatan is capped at 12jt
		expect(bpjs.kesehatanCompany).toBe(480_000); // 4% of 12jt
		expect(bpjs.kesehatanEmployee).toBe(120_000); // 1% of 12jt
	});
});

describe("Overtime Calculator (PP 35/2021)", () => {
	it("computes hourly rate and tiered overtime pay", () => {
		const ot = calculateOvertime({
			basicSalary: 10_000_000,
			weekdayOvertimeHours: 2,
		});

		// Hourly rate = round(10.000.000 / 173) = 57.803
		expect(ot.hourlyRate).toBe(57_803);
		// 1st hour = 1.5 * 57.803 = 86.705
		// 2nd hour = 2.0 * 57.803 = 115.606
		// Total = 202.311
		expect(ot.weekdayOvertimePay).toBe(202_311);
	});
});

describe("Payroll Calculator Unified Engine", () => {
	it("calculates Gross payroll for monthly period (TER A)", () => {
		const result = calculatePayroll({
			basicSalary: 10_000_000,
			ptkpCode: "TK/0",
			taxMethod: "gross",
			month: 3,
		});

		expect(result.tax.terCategory).toBe("TER_A");
		expect(result.tax.pph21Monthly).toBeGreaterThan(0);
		expect(result.netPay).toBeLessThan(10_000_000);
		expect(result.explanation).toContain("Bulan 3");
	});

	it("calculates Gross-Up payroll preserving take-home pay", () => {
		const result = calculatePayroll({
			basicSalary: 10_000_000,
			ptkpCode: "TK/0",
			taxMethod: "gross_up",
			month: 3,
		});

		expect(result.taxAllowance).toBeGreaterThan(0);
		expect(result.tax.pph21Monthly).toBe(result.taxAllowance);
		// With gross-up, employee take home pay is exactly basicSalary - employee BPJS deductions
		expect(result.netPay).toBe(
			10_000_000 - result.bpjs.totalEmployeeBpjs,
		);
	});

	it("performs December annual reconciliation using Article 17 progressive tax", () => {
		const monthlyGross = 10_000_000;
		const ytd11MonthsGross = monthlyGross * 11;
		const ytd11MonthsPph21 = 200_000 * 11; // mock ~200k/mo
		const ytd11MonthsJht = 200_000 * 11;
		const ytd11MonthsJp = 100_000 * 11;

		const result = calculatePayroll({
			basicSalary: monthlyGross,
			ptkpCode: "TK/0",
			taxMethod: "gross",
			month: 12,
			ytdContext: {
				ytdGrossJanToNov: ytd11MonthsGross,
				ytdPph21JanToNov: ytd11MonthsPph21,
				ytdJhtEmployeeJanToNov: ytd11MonthsJht,
				ytdJpEmployeeJanToNov: ytd11MonthsJp,
			},
		});

		expect(result.tax.isDecemberReconciliation).toBe(true);
		expect(result.tax.annualizedGross).toBeGreaterThan(120_000_000);
		expect(result.tax.taxableIncomeAnnual).toBeDefined();
		expect(result.tax.annualPph21Calculated).toBeDefined();
		expect(result.explanation).toContain("Bulan 12 (Rekonsiliasi Tahunan)");
	});
});
