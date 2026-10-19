import { describe, expect, it } from "vitest";
import { redactPii } from "./redact-pii.ts";

describe("redactPii", () => {
	it("redacts inline PII inside strings", (): void => {
		expect(
			redactPii(
				"Contact budi@example.com or +6281234567890, NIK 3171010101900001.",
			),
		).toBe("Contact [REDACTED] or [REDACTED], NIK [REDACTED].");
	});

	it("redacts tax, bank, passport, and address details", (): void => {
		expect(
			redactPii(
				"NPWP 09.123.456.7-890.000, rekening 1234567890123, passport A1234567, alamat Jl. Sudirman No. 10.",
			),
		).toBe(
			"NPWP [REDACTED], rekening [REDACTED], passport [REDACTED], alamat [REDACTED].",
		);
	});

	it("redacts lowercase addresses after an address label", (): void => {
		expect(redactPii("alamat: jalan sudirman no 10")).toBe(
			"alamat: [REDACTED]",
		);
	});

	it("does not redact ordinary uses of the word jalan", (): void => {
		const input = "Bagaimana jalan nya proses payroll?";
		expect(redactPii(input)).toBe(input);
	});

	it("redacts sensitive object keys recursively", (): void => {
		expect(
			redactPii({
				email: "budi@example.com",
				phone: "081234567890",
				nested: { idCardNumber: "3171010101900001", note: "safe" },
				salary: 8_000_000,
				fullName: "Budi",
				alamat: "Jl. Sudirman No. 10",
			}),
		).toEqual({
			email: "[REDACTED]",
			phone: "[REDACTED]",
			nested: { idCardNumber: "[REDACTED]", note: "safe" },
			salary: "[REDACTED]",
			fullName: "[REDACTED]",
			alamat: "[REDACTED]",
		});
	});

	it("redacts standalone 16-digit numbers", (): void => {
		expect(redactPii({ reference: 3171010101900001 })).toEqual({
			reference: "[REDACTED]",
		});
	});

	it("leaves non-PII values untouched", (): void => {
		const input = { score: 87, reason: "headcount variance", active: true };
		expect(redactPii(input)).toEqual(input);
	});
});
