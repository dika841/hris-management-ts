import { expect, test } from "@playwright/test";
import { SEED_CREDENTIALS } from "../support/credentials.ts";
import { signIn } from "../support/sign-in.ts";

test.describe("analytics", () => {
	test("shows workforce and payroll analytics", async ({
		page,
	}): Promise<void> => {
		await signIn(page, SEED_CREDENTIALS.admin);
		await page.goto("/analytics");

		await expect(
			page.getByRole("heading", { name: /HR Analytics|Analitik HR/ }),
		).toBeVisible();
		await expect(
			page.getByText(/Active Headcount|Headcount Aktif/),
		).toBeVisible();
		await expect(
			page.getByText(/Headcount by Department|Headcount per Departemen/),
		).toBeVisible();
		await expect(
			page.getByText(/Payroll Cost Trend|Tren Biaya Payroll/),
		).toBeVisible();
		await expect(
			page.getByText(/Attendance Summary|Ringkasan Kehadiran/),
		).toBeVisible();
	});
});
