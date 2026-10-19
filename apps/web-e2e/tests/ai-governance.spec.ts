import { expect, test } from "@playwright/test";
import { SEED_CREDENTIALS } from "../support/credentials.ts";
import { signIn } from "../support/sign-in.ts";

test.describe("AI governance", () => {
	test("redacts PII and supports human review", async ({
		page,
	}): Promise<void> => {
		await signIn(page, SEED_CREDENTIALS.admin);
		await page.goto("/ai-governance");

		await expect(
			page.getByRole("heading", { name: /AI Governance|Tata Kelola AI/ }),
		).toBeVisible();

		await page.getByLabel("Feature").fill("e2e_ai_ui");
		await page.getByLabel("Model").fill("deepseek-chat");
		await page
			.getByLabel("Prompt hash")
			.fill("sha256:e2e-ui-decision-hash-001");
		await page
			.getByLabel("Decision JSON")
			.fill(
				'{"email":"budi@example.com","note":"Call 081234567890","recommendation":"review"}',
			);
		await page.getByRole("button", { name: /Log AI decision/ }).click();

		const row = page.getByRole("row").filter({ hasText: "e2e_ai_ui" });
		await expect(row).toBeVisible();
		await expect(row.getByText(/Pending review|Menunggu review/)).toBeVisible();

		await row.getByText(/View|Lihat/).click();
		await expect(row).toContainText("[REDACTED]");
		await expect(row).not.toContainText("budi@example.com");

		page.once("dialog", (dialog) => dialog.accept("Looks correct."));
		await row.getByRole("button", { name: /Approve|Setujui/ }).click();
		await expect(row.getByText(/Approved|Disetujui/)).toBeVisible();

		await page.getByLabel("Feature").fill("e2e_ai_ui_reject");
		await page.getByLabel("Model").fill("deepseek-chat");
		await page
			.getByLabel("Prompt hash")
			.fill("sha256:e2e-ui-decision-hash-002");
		await page.getByRole("button", { name: /Log AI decision/ }).click();

		const rejectRow = page
			.getByRole("row")
			.filter({ hasText: "e2e_ai_ui_reject" });
		await expect(rejectRow).toBeVisible();
		page.once("dialog", (dialog) => dialog.accept("Needs more evidence."));
		await rejectRow.getByRole("button", { name: /Reject|Tolak/ }).click();
		await expect(rejectRow.getByText(/Rejected|Ditolak/)).toBeVisible();
	});
});
