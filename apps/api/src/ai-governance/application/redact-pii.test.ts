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

	it("redacts sensitive object keys recursively", (): void => {
		expect(
			redactPii({
				email: "budi@example.com",
				phone: "081234567890",
				nested: { idCardNumber: "3171010101900001", note: "safe" },
				salary: 8_000_000,
			}),
		).toEqual({
			email: "[REDACTED]",
			phone: "[REDACTED]",
			nested: { idCardNumber: "[REDACTED]", note: "safe" },
			salary: 8_000_000,
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
