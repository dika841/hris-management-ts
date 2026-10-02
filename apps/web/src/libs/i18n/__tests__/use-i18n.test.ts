import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { LOCALE } from "../locale.ts";
import { localeSet } from "../locale-store.ts";
import { useI18n } from "../use-i18n.ts";

describe("useI18n", () => {
	beforeEach(() => {
		localeSet(LOCALE.EN);
	});

	it("translates English keys correctly", () => {
		const { result } = renderHook(() => useI18n());

		expect(result.current.locale).toBe(LOCALE.EN);
		expect(result.current.isEnglish).toBe(true);
		expect(result.current.isIndonesian).toBe(false);
		expect(result.current.t("nav.dashboard")).toBe("Dashboard");
		expect(result.current.t("nav.employees")).toBe("Employees");
		expect(result.current.t("app.name")).toBe("HRIS Management");
	});

	it("translates Indonesian keys when locale is switched", () => {
		const { result } = renderHook(() => useI18n());

		act(() => {
			result.current.setLocale(LOCALE.ID);
		});

		expect(result.current.locale).toBe(LOCALE.ID);
		expect(result.current.isEnglish).toBe(false);
		expect(result.current.isIndonesian).toBe(true);
		expect(result.current.t("nav.dashboard")).toBe("Dasbor");
		expect(result.current.t("nav.employees")).toBe("Karyawan");
		expect(result.current.t("app.darkMode")).toBe("Mode gelap");
	});

	it("supports string parameter interpolation", () => {
		const { result } = renderHook(() => useI18n());

		expect(result.current.t("table.pageOf", { current: 2, total: 10 })).toBe(
			"Page 2 of 10",
		);

		act(() => {
			result.current.setLocale(LOCALE.ID);
		});

		expect(result.current.t("table.pageOf", { current: 2, total: 10 })).toBe(
			"Halaman 2 dari 10",
		);
	});

	it("returns fallback key if translation does not exist", () => {
		const { result } = renderHook(() => useI18n());

		expect(result.current.t("non.existent.key")).toBe("non.existent.key");
	});
});
