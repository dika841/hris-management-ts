import { expect, type Page, test } from "@playwright/test";
import { SEED_CREDENTIALS } from "../support/credentials.ts";
import { signIn } from "../support/sign-in.ts";

test.describe.configure({ mode: "serial" });

test.describe("notifications", () => {
	let page: Page;

	test.beforeAll(async ({ browser }): Promise<void> => {
		page = await browser.newPage();
		await signIn(page, SEED_CREDENTIALS.admin);
	});

	test.afterAll(async (): Promise<void> => {
		await page.close();
	});

	test("opens the bell and the notifications page", async (): Promise<void> => {
		await page.getByRole("button", { name: "Notifications" }).click();
		await expect(page.getByText("Notifications").first()).toBeVisible();

		await page
			.getByRole("menuitem", { name: "View all notifications" })
			.click();
		await expect(page).toHaveURL(/\/notifications$/);
		await expect(
			page.getByRole("heading", { name: "Notifications" }),
		).toBeVisible();
	});
});
