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
			.getByLabel(/Question|Pertanyaan/)
			.fill("Summarize attendance for budi@example.com.");
		await page
			.getByRole("button", {
				name: /Add supporting data|Tambahkan data pendukung/,
			})
			.click();
		await page
			.getByLabel(/Supporting data|Data pendukung/)
			.fill("Period 2026-10, 4 late arrivals.");
		await page.getByRole("button", { name: /Ask AI|Tanya AI/ }).click();

		await expect(page.getByText("Mock summary from DeepSeek.")).toBeVisible();
		await expect(
			page.getByText("Review late arrivals and confirm staffing coverage."),
		).toBeVisible();
		await expect(
			page.getByText(/Pending review|Menunggu review/),
		).toBeVisible();
		await expect(page.getByText(/82%/)).toBeVisible();
		await expect(page.getByText(/PII redacted/)).toBeVisible();

		await page.getByRole("button", { name: /Approve|Setujui/ }).click();
		await expect(page.getByText(/^(Approved|Disetujui)$/)).toBeVisible();
	});
});
