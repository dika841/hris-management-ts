import { Store } from "@tanstack/store";
import { match } from "ts-pattern";
import {
	DEFAULT_LOCALE,
	LOCALE,
	LOCALE_STORAGE_KEY,
	type TLocale,
} from "./locale.ts";

const localeRead = (): TLocale => {
	if (typeof window === "undefined" || !window.localStorage) {
		return DEFAULT_LOCALE;
	}

	return match(localStorage.getItem(LOCALE_STORAGE_KEY))
		.with(LOCALE.ID, (): TLocale => LOCALE.ID)
		.with(LOCALE.EN, (): TLocale => LOCALE.EN)
		.otherwise((): TLocale => DEFAULT_LOCALE);
};

const localeApply = (locale: TLocale): void => {
	if (typeof document !== "undefined") {
		document.documentElement.lang = locale;
	}
	if (typeof localStorage !== "undefined") {
		localStorage.setItem(LOCALE_STORAGE_KEY, locale);
	}
};

const initialLocale = localeRead();
localeApply(initialLocale);

export const localeStore = new Store<TLocale>(initialLocale);

export const localeSet = (locale: TLocale): void => {
	localeApply(locale);
	localeStore.setState(() => locale);
};

export const localeToggle = (): void => {
	localeSet(
		match(localeStore.state)
			.with(LOCALE.EN, (): TLocale => LOCALE.ID)
			.otherwise((): TLocale => LOCALE.EN),
	);
};
