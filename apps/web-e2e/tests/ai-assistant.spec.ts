import { expect, test } from "@playwright/test";
import { SEED_CREDENTIALS } from "../support/credentials.ts";
import { signIn } from "../support/sign-in.ts";

test.describe("AI assistant", () => {
	test("runs through the enabled flag and records a pending review", async ({
		page,
	}): Promise<void> => {
		await signIn(page, SEED_CREDENTIALS.admin);

		await page.goto("/feature-flags");
		await page.getByLabel("Key").fill("ai_assistant");
		await page.getByLabel("Name").fill("AI Assistant");
		await page.getByLabel("Rollout").fill("100");
		await page.getByRole("switch").first().click();
		await page
			.getByRole("button", { name: /Create flag|Buat Feature Flag/ })
			.click();
		await expect(
			page.getByRole("row").filter({ hasText: "ai_assistant" }),
		).toBeVisible();

		await page.goto("/ai-assistant");
		await expect(
			page.getByRole("heading", { name: /AI Assistant|Asisten AI/ }),
		).toBeVisible();
		await page
			.getByLabel(/Instruction|Instruksi/)
			.fill("Summarize attendance for budi@example.com.");
		await page
			.getByLabel(/JSON context|Konteks JSON/)
			.fill('{"period":"2026-10"}');
		await page.getByRole("button", { name: /Run|Jalankan/ }).click();

		await expect(page.getByText("Mock summary from DeepSeek.")).toBeVisible();
		await expect(
			page.getByText("Review late arrivals and confirm staffing coverage."),
		).toBeVisible();
		await expect(
			page.getByText(/Pending review|Menunggu review/),
		).toBeVisible();
		await expect(page.getByText(/82%/)).toBeVisible();
		await expect(page.getByText(/PII redacted/)).toBeVisible();
	});
});
