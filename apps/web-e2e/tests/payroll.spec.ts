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

		const employeeSelect = page.getByRole("combobox").first();
		await employeeSelect.click();
		await page.getByRole("option").first().click();
		await page.getByLabel("Nominal (IDR)").fill("1000000");
		await page.getByLabel("Catatan").fill("E2E allowance");
		await page.getByRole("button", { name: "Tambah Komponen" }).click();
		await expect(page.getByText("E2E allowance")).toBeVisible();

		await page.getByTitle("Buka slip gaji").first().click();
		await expect(
			page.getByRole("heading", { name: "Slip Gaji" }),
		).toBeVisible();
		await expect(page.getByText("E2E allowance")).toBeVisible();
		await page.getByRole("link", { name: "Kembali ke Periode" }).click();
		await expect(
			page.getByRole("heading", { name: PERIOD_NAME }),
		).toBeVisible();

		await page.getByRole("link", { name: "Laporan Payroll" }).click();
		await expect(
			page.getByRole("heading", { name: "Laporan Payroll & PPh 21" }),
		).toBeVisible();
		await expect(page.getByText("Rekap Per Karyawan")).toBeVisible();

		const reportDownloadPromise = page.waitForEvent("download");
		await page.getByRole("button", { name: "Export CSV" }).click();
		const reportDownload = await reportDownloadPromise;
		expect(reportDownload.suggestedFilename()).toContain("laporan-payroll-");

		await page.getByRole("link", { name: "Kembali ke Periode" }).click();
		await expect(
			page.getByRole("heading", { name: PERIOD_NAME }),
		).toBeVisible();

		await page.getByRole("button", { name: "Hitung Ulang" }).click();
		await expect(page.getByRole("button", { name: "Setujui" })).toBeVisible({
			timeout: 20_000,
		});

		const downloadPromise = page.waitForEvent("download");
		await page.getByRole("button", { name: "Export Transfer Bank" }).click();
		const download = await downloadPromise;
		expect(download.suggestedFilename()).toContain("transfer-bank-");

		await page.getByRole("button", { name: "Setujui" }).click();
		await expect(page.getByText("Disetujui", { exact: true })).toBeVisible();

		await page.getByRole("button", { name: "Tandai Dibayar" }).click();
		await expect(page.getByText("Dibayar", { exact: true })).toBeVisible();

		await page.getByRole("button", { name: "Kunci Periode" }).click();
		await expect(page.getByText("Terkunci", { exact: true })).toBeVisible();
	});
});
