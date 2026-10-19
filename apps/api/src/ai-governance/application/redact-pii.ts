const SENSITIVE_KEY =
	/(email|phone|mobile|whatsapp|telepon|hp|nik|ktp|idcard|npwp|bank|rekening|account|address|alamat|passport|ssn|salary|gaji|upah|kompensasi|compensation|birth|dob|tanggal_?lahir|nama|name)/i;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_PATTERN = /(?:\+62|62|0)8\d{7,12}\b/g;
const NPWP_PATTERN = /\b\d{2}\.\d{3}\.\d{3}\.\d-\d{3}\.\d{3}\b/g;
const ID_NUMBER_PATTERN = /\b\d{15,16}\b/g;
const BANK_ACCOUNT_PATTERN = /\b\d{10,14}\b/g;
const PASSPORT_PATTERN = /\b[A-Z]{1,2}\d{6,8}\b/g;
const ADDRESS_PATTERN =
	/\b(?:Jl\.?|Jalan|Gang|Gg\.?|Komplek|Perumahan|Perum\.?)\s+(?=[A-Z0-9])[^\n,;]*[^\n,;.\s]/g;
const ADDRESS_LABEL_PATTERN =
	/(\b(?:alamat|address)\s*:?\s*)(?:Jl\.?|Jalan|Gang|Gg\.?|Komplek|Perumahan|Perum\.?)\s+[^\n,;]*[^\n,;.\s]/gi;
const RT_RW_PATTERN = /\bRT\s*\.?\s*\d{1,3}\s*\/\s*RW\s*\.?\s*\d{1,3}\b/gi;
const REDACTED = "[REDACTED]";

const redactString = (value: string): string =>
	value
		.replace(EMAIL_PATTERN, REDACTED)
		.replace(PHONE_PATTERN, REDACTED)
		.replace(NPWP_PATTERN, REDACTED)
		.replace(ID_NUMBER_PATTERN, REDACTED)
		.replace(BANK_ACCOUNT_PATTERN, REDACTED)
		.replace(PASSPORT_PATTERN, REDACTED)
		.replace(ADDRESS_LABEL_PATTERN, `$1${REDACTED}`)
		.replace(ADDRESS_PATTERN, REDACTED)
		.replace(RT_RW_PATTERN, REDACTED);

export const redactPii = (value: unknown): unknown => {
	if (typeof value === "string") {
		return redactString(value);
	}
	if (typeof value === "number") {
		return Number.isInteger(value) && Math.abs(value) >= 1_000_000_000_000_000
			? REDACTED
			: value;
	}
	if (Array.isArray(value)) {
		return value.map(redactPii);
	}
	if (value !== null && typeof value === "object") {
		return Object.fromEntries(
			Object.entries(value).map(([key, entry]) => [
				key,
				SENSITIVE_KEY.test(key) ? REDACTED : redactPii(entry),
			]),
		);
	}
	return value;
};
