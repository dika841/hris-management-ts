import { expect, type Page, test } from "@playwright/test";
import { ROLE_KEY, ROLE_LABEL } from "../support/access.ts";
import { SEED_CREDENTIALS } from "../support/credentials.ts";
import { selectOption } from "../support/select.ts";
import { signIn } from "../support/sign-in.ts";
import { signOut } from "../support/sign-out.ts";
import { createUser } from "../support/users.ts";

const USER = {
	name: "E2E Self Space",
	email: "e2e-self-space@test.app",
	password: "self-space-password-123",
	role: ROLE_KEY.MEMBER,
};

const EMPLOYEE = {
	code: "E2E-ME-EMP",
	name: "E2E My Space Employee",
	email: "e2e-me-employee@test.app",
	idCard: "3171010101900066",
};

test.describe.configure({ mode: "serial" });

test.describe("employee self-service", () => {
	let page: Page;

	test.beforeAll(async ({ browser }): Promise<void> => {
		page = await browser.newPage();
	});

	test.afterAll(async (): Promise<void> => {
		await page.close();
	});

	test("links a member account and uses My Space", async (): Promise<void> => {
		await signIn(page, SEED_CREDENTIALS.admin);
		await createUser(page, USER, ROLE_LABEL[ROLE_KEY.MEMBER]);
		await page.goto("/employees/create");
		await page.getByLabel(/Kode Karyawan/).fill(EMPLOYEE.code);
		await page.getByLabel(/NIK \(KTP/).fill(EMPLOYEE.idCard);
		await page.getByLabel(/Nama Lengkap/).fill(EMPLOYEE.name);
		await page.getByLabel(/Email Perusahaan/).fill(EMPLOYEE.email);
		await selectOption(
			page,
			page.getByLabel(/Akun Login Terhubung/),
			`${USER.name} (${USER.email})`,
		);
		await page.locator("#pdp-consent").check();
		await page.getByRole("button", { name: "Simpan Data Karyawan" }).click();
		await expect(page).toHaveURL(/\/employees(\?.*)?$/);

		await signOut(page);
		await signIn(page, { email: USER.email, password: USER.password });
		await page.goto("/me");
		await expect(
			page.getByRole("heading", { name: "Ruang Saya" }),
		).toBeVisible();
		await expect(page.getByText(EMPLOYEE.name)).toBeVisible();

		await page.getByRole("button", { name: "Presensi" }).click();
		await expect(page.getByText("Presensi Bulan Ini")).toBeVisible();
		await page.getByRole("button", { name: "Clock In" }).click();
		await expect(page.getByRole("button", { name: "Clock In" })).toBeDisabled();

		await page.getByRole("button", { name: "Cuti" }).click();
		await selectOption(
			page,
			page.getByRole("combobox").first(),
			"Cuti Tanpa Upah",
		);
		await page.getByLabel("Alasan").fill("E2E self leave");
		await page.getByRole("button", { name: "Kirim Pengajuan" }).click();
		await expect(page.getByText("E2E self leave")).toBeVisible();

		await page.getByRole("button", { name: "Lembur" }).click();
		await page.getByRole("button", { name: "Kirim Pengajuan" }).click();
		await expect(page.getByText(/18:00–20:00/)).toBeVisible();

		await page.getByRole("button", { name: "Slip Gaji" }).click();
		await expect(page.getByText("Belum ada slip gaji.")).toBeVisible();
	});
});
