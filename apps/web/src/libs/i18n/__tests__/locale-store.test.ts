import { beforeEach, describe, expect, it } from "vitest";
import { LOCALE, LOCALE_STORAGE_KEY } from "../locale.ts";
import { localeSet, localeStore, localeToggle } from "../locale-store.ts";

describe("localeStore", () => {
	beforeEach(() => {
		localStorage.clear();
		localeSet(LOCALE.EN);
	});

	it("defaults to English", () => {
		expect(localeStore.state).toBe(LOCALE.EN);
	});

	it("updates state and localStorage on localeSet", () => {
		localeSet(LOCALE.ID);
		expect(localeStore.state).toBe(LOCALE.ID);
		expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe(LOCALE.ID);
		expect(document.documentElement.lang).toBe(LOCALE.ID);
	});

	it("toggles between EN and ID on localeToggle", () => {
		expect(localeStore.state).toBe(LOCALE.EN);
		localeToggle();
		expect(localeStore.state).toBe(LOCALE.ID);
		localeToggle();
		expect(localeStore.state).toBe(LOCALE.EN);
	});
});
