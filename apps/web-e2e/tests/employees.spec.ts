import { expect, type Page, test } from "@playwright/test";
import { SEED_CREDENTIALS } from "../support/credentials.ts";
import { signIn } from "../support/sign-in.ts";

const EMPLOYEE = {
	code: "E2E-WEB-EMP",
	name: "E2E Web Employee",
	email: "e2e-web-employee@test.app",
	idCard: "3171010101900099",
	updatedPosition: "Engineering Manager",
};

test.describe.configure({ mode: "serial" });

test.describe("employee flow", () => {
	let page: Page;

	test.beforeAll(async ({ browser }): Promise<void> => {
		page = await browser.newPage();
		await signIn(page, SEED_CREDENTIALS.admin);
	});

	test.afterAll(async (): Promise<void> => {
		await page.close();
	});

	test("creates, opens, and edits an employee", async (): Promise<void> => {
		await page.goto("/employees/create");
		await expect(
			page.getByRole("heading", { name: "Registrasi Karyawan Baru" }),
		).toBeVisible();

		await page.getByLabel(/Kode Karyawan/).fill(EMPLOYEE.code);
		await page.getByLabel(/NIK \(KTP/).fill(EMPLOYEE.idCard);
		await page.getByLabel(/Nama Lengkap/).fill(EMPLOYEE.name);
		await page.getByLabel(/Email Perusahaan/).fill(EMPLOYEE.email);
		await page.locator("#pdp-consent").check();
		await page.getByRole("button", { name: "Simpan Data Karyawan" }).click();

		await expect(page).toHaveURL(/\/employees(\?.*)?$/);
		const row = page.getByRole("row").filter({ hasText: EMPLOYEE.email });
		await expect(row).toBeVisible();
		await expect(row).toContainText(EMPLOYEE.name);

		await page.getByRole("link", { name: EMPLOYEE.code, exact: true }).click();
		await expect(
			page.getByRole("heading", { name: EMPLOYEE.name }),
		).toBeVisible();

		await page.getByRole("link", { name: "Edit Data" }).click();
		await expect(
			page.getByRole("heading", { name: "Perbarui Data Karyawan" }),
		).toBeVisible();

		await page.getByLabel(/Jabatan \/ Posisi/).fill(EMPLOYEE.updatedPosition);
		await page.getByRole("button", { name: "Simpan Perubahan" }).click();

		await expect(page).toHaveURL(/\/employees\/[^/]+$/);
		await expect(
			page.getByText(EMPLOYEE.updatedPosition, { exact: true }),
		).toBeVisible();
	});
});
