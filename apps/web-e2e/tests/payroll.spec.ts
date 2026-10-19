import { expect, type Page, test } from "@playwright/test";
import { SEED_CREDENTIALS } from "../support/credentials.ts";
import { signIn } from "../support/sign-in.ts";

const PERIOD_NAME = `E2E Web Payroll ${Date.now()}`;

test.describe.configure({ mode: "serial" });

test.describe("payroll flow", () => {
	let page: Page;

	test.beforeAll(async ({ browser }): Promise<void> => {
		page = await browser.newPage();
		await signIn(page, SEED_CREDENTIALS.admin);
	});

	test.afterAll(async (): Promise<void> => {
		await page.close();
	});

	test("creates, calculates, approves, pays, and locks a payroll period", async (): Promise<void> => {
		await page.goto("/payroll/create");
		await page.getByLabel(/Nama Periode Penggajian/).fill(PERIOD_NAME);
		await page.getByRole("button", { name: "Buka Siklus Penggajian" }).click();

		await expect(page).toHaveURL(/\/payroll\/[^/]+$/);
		await expect(
			page.getByRole("heading", { name: PERIOD_NAME }),
		).toBeVisible();

		await page.getByRole("button", { name: "Hitung Ulang" }).click();
		await expect(page.getByRole("button", { name: "Setujui" })).toBeVisible({
			timeout: 20_000,
		});

		await expect(page.getByText("Rincian Gaji Karyawan")).toBeVisible();

		await page.getByRole("button", { name: "Setujui" }).click();
		await expect(page.getByText("Disetujui", { exact: true })).toBeVisible();

		await page.getByRole("button", { name: "Tandai Dibayar" }).click();
		await expect(page.getByText("Dibayar", { exact: true })).toBeVisible();

		await page.getByRole("button", { name: "Kunci Periode" }).click();
		await expect(page.getByText("Terkunci", { exact: true })).toBeVisible();
	});
});
