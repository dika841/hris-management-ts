import { describe, expect, it } from "vitest";
import * as i18n from "../index.ts";

describe("i18n exports", () => {
	it("exports all necessary symbols", () => {
		expect(i18n.LOCALE).toBeDefined();
		expect(i18n.DEFAULT_LOCALE).toBe(i18n.LOCALE.EN);
		expect(i18n.useI18n).toBeDefined();
		expect(i18n.localeStore).toBeDefined();
		expect(i18n.localeSet).toBeDefined();
		expect(i18n.localeToggle).toBeDefined();
		expect(i18n.LanguageSwitcher).toBeDefined();
	});
});
