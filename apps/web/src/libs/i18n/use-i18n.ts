import { useStore } from "@tanstack/react-store";
import { useCallback } from "react";
import {
	DEFAULT_LOCALE,
	LOCALE,
	LOCALES,
	type TLocale,
	type TLocaleInfo,
} from "./locale.ts";
import { localeSet, localeStore, localeToggle } from "./locale-store.ts";
import { en, type TTranslationSchema } from "./locales/en.ts";
import { id } from "./locales/id.ts";

const dictionaries: Record<TLocale, TTranslationSchema> = {
	[LOCALE.EN]: en,
	[LOCALE.ID]: id,
};

type NestedKeyOf<T> = T extends object
	? {
			[K in keyof T & string]: T[K] extends object
				? `${K}.${NestedKeyOf<T[K]>}`
				: K;
		}[keyof T & string]
	: never;

export type TTranslationKey = NestedKeyOf<TTranslationSchema>;

const resolveKey = (dict: unknown, path: string): string | undefined => {
	const segments = path.split(".");
	let current: unknown = dict;

	for (const segment of segments) {
		if (
			current === null ||
			current === undefined ||
			typeof current !== "object"
		) {
			return undefined;
		}
		current = (current as Record<string, unknown>)[segment];
	}

	return typeof current === "string" ? current : undefined;
};

const interpolate = (
	text: string,
	params?: Record<string, string | number>,
): string => {
	if (!params) {
		return text;
	}

	return Object.entries(params).reduce((acc, [key, value]) => {
		return acc.replaceAll(`{${key}}`, String(value));
	}, text);
};

export type TUseI18n = {
	locale: TLocale;
	currentLocaleInfo: TLocaleInfo;
	isIndonesian: boolean;
	isEnglish: boolean;
	setLocale: (locale: TLocale) => void;
	toggleLocale: () => void;
	t: (
		key: TTranslationKey | (string & {}),
		params?: Record<string, string | number>,
	) => string;
	locales: typeof LOCALES;
};

export const useI18n = (): TUseI18n => {
	const currentLocale = useStore(localeStore);

	const t = useCallback(
		(
			key: TTranslationKey | (string & {}),
			params?: Record<string, string | number>,
		): string => {
			const dict = dictionaries[currentLocale] ?? dictionaries[DEFAULT_LOCALE];
			let translated = resolveKey(dict, key);

			if (!translated && currentLocale !== DEFAULT_LOCALE) {
				translated = resolveKey(dictionaries[DEFAULT_LOCALE], key);
			}

			if (!translated) {
				return key;
			}

			return interpolate(translated, params);
		},
		[currentLocale],
	);

	return {
		locale: currentLocale,
		currentLocaleInfo: LOCALES[currentLocale],
		isIndonesian: currentLocale === LOCALE.ID,
		isEnglish: currentLocale === LOCALE.EN,
		setLocale: localeSet,
		toggleLocale: localeToggle,
		t,
		locales: LOCALES,
	};
};
