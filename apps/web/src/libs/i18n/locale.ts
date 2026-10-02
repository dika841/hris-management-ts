export const LOCALE = {
	EN: "en",
	ID: "id",
} as const;

export type TLocale = (typeof LOCALE)[keyof typeof LOCALE];

export const LOCALE_STORAGE_KEY = "hris:locale";

export const DEFAULT_LOCALE: TLocale = LOCALE.EN;

export type TLocaleInfo = {
	code: TLocale;
	name: string;
	nativeName: string;
	shortLabel: string;
	flag: string;
};

export const LOCALES: Record<TLocale, TLocaleInfo> = {
	[LOCALE.EN]: {
		code: LOCALE.EN,
		name: "English",
		nativeName: "English",
		shortLabel: "EN",
		flag: "🇺🇸",
	},
	[LOCALE.ID]: {
		code: LOCALE.ID,
		name: "Indonesian",
		nativeName: "Bahasa Indonesia",
		shortLabel: "ID",
		flag: "🇮🇩",
	},
};
