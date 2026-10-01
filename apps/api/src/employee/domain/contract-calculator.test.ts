import { describe, expect, it } from "vitest";
import {
	calculatePkwtCompensation,
	calculateTenureMonths,
	isPkwtOverMaxDuration,
} from "./contract-calculator.ts";

describe("PP 35/2021 PKWT Calculator", () => {
	it("calculates exact 1 year tenure as 1 month salary compensation", () => {
		const comp = calculatePkwtCompensation(
			"2025-01-01",
			"2026-01-01",
			10_000_000,
		);
		// 365 days / 30 = 12.17 months -> approx 10_000_000
		expect(comp).toBeGreaterThanOrEqual(10_000_000);
		expect(comp).toBeLessThanOrEqual(10_200_000);
	});

	it("calculates 6 months tenure as half of 1 month salary", () => {
		const comp = calculatePkwtCompensation(
			"2026-01-01",
			"2026-07-01",
			10_000_000,
		);
		expect(comp).toBeGreaterThanOrEqual(4_900_000);
		expect(comp).toBeLessThanOrEqual(5_100_000);
	});

	it("returns 0 compensation for tenure under 1 month", () => {
		const comp = calculatePkwtCompensation(
			"2026-01-01",
			"2026-01-15",
			10_000_000,
		);
		expect(comp).toBe(0);
	});

	it("flags PKWT exceeding 5 years (60 months)", () => {
		expect(isPkwtOverMaxDuration(59)).toBe(false);
		expect(isPkwtOverMaxDuration(60)).toBe(false);
		expect(isPkwtOverMaxDuration(61)).toBe(true);
	});
});

it("calculateTenureMonths accurately counts months", () => {
	expect(
		calculateTenureMonths("2024-01-01", "2024-07-01"),
	).toBeGreaterThanOrEqual(5.9);
});
