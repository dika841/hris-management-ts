import { expect, type Page, test } from "@playwright/test";
import { SEED_CREDENTIALS } from "../support/credentials.ts";
import { selectOption } from "../support/select.ts";
import { signIn } from "../support/sign-in.ts";

const LOG_EMPLOYEE_OPTION = "Budi Pratama (EMP-001) - Software Engineer";
const REPORT_EMPLOYEE_OPTION = "Budi Pratama (EMP-001)";
const ATTENDANCE_DATE = "2026-10-01";

test.describe.configure({ mode: "serial" });

test.describe("attendance flow", () => {
	let page: Page;

	test.beforeAll(async ({ browser }): Promise<void> => {
		page = await browser.newPage();
		await signIn(page, SEED_CREDENTIALS.admin);
	});

	test.afterAll(async (): Promise<void> => {
		await page.close();
	});

	test("records attendance and shows it in the monthly report", async (): Promise<void> => {
		await page.goto("/attendance/log/create");
		await selectOption(
			page,
			page.getByLabel(/Pilih Karyawan/),
			LOG_EMPLOYEE_OPTION,
		);
		await page.getByLabel(/Tanggal Presensi/).fill(ATTENDANCE_DATE);
		await page.getByLabel(/Jam Masuk/).fill("08:15");
		await page.getByLabel(/Jam Keluar/).fill("17:10");
		await page.getByRole("button", { name: "Simpan Presensi" }).click();

		await expect(page).toHaveURL(/\/attendance(\?.*)?$/);
		await expect(
			page.getByRole("heading", { name: "Time & Attendance" }),
		).toBeVisible();

		const row = page
			.getByRole("row")
			.filter({ hasText: ATTENDANCE_DATE })
			.first();
		await row.getByTitle("Koreksi presensi").click();
		await expect(page).toHaveURL(/\/attendance\/log\/create\?/);
		const checkInInput = page.getByLabel(/Jam Masuk/);
		await expect(checkInInput).toHaveValue("08:15");
		await checkInInput.fill("08:30");
		await page.getByRole("button", { name: "Simpan Presensi" }).click();
		await expect(page).toHaveURL(/\/attendance(\?.*)?$/);

		await page.goto("/attendance/report");
		await expect(
			page.getByRole("heading", { name: "Rekap Absensi Bulanan" }),
		).toBeVisible();

		await selectOption(
			page,
			page.getByRole("combobox").first(),
			REPORT_EMPLOYEE_OPTION,
		);
		await page.getByLabel("Bulan").fill("10");
		await page.getByLabel("Tahun").fill("2026");

		await expect(page.getByText("30 menit")).toBeVisible();
	});
});
