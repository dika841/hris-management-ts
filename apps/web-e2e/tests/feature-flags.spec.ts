import { expect, test } from "@playwright/test";
import { SEED_CREDENTIALS } from "../support/credentials.ts";
import { signIn } from "../support/sign-in.ts";

test.describe("feature flags", () => {
	test("creates, updates, and deletes a flag", async ({
		page,
	}): Promise<void> => {
		await signIn(page, SEED_CREDENTIALS.admin);
		await page.goto("/feature-flags");

		await expect(
			page.getByRole("heading", { name: /Feature Flags|Feature Flag/ }),
		).toBeVisible();

		await page.getByLabel("Key").fill("e2e_ui_flag");
		await page.getByLabel("Name").fill("E2E UI Flag");
		await page.getByLabel("Rollout").fill("100");
		await page.getByRole("switch").first().click();
		await page
			.getByRole("button", { name: /Create flag|Buat Feature Flag/ })
			.click();

		const row = page.getByRole("row").filter({ hasText: "e2e_ui_flag" });
		await expect(row).toBeVisible();
		await expect(row.getByText(/You: on|Anda: aktif/)).toBeVisible();

		await row.locator('input[type="number"]').fill("25");
		await row.getByRole("button", { name: /Save|Simpan/ }).click();
		await expect(row).toBeVisible();

		page.once("dialog", (dialog) => dialog.accept());
		await row
			.getByRole("button", { name: /Delete feature flag|Hapus feature flag/ })
			.click();
		await expect(row).toHaveCount(0);
	});
});
