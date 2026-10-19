const SENSITIVE_KEY =
	/(email|phone|mobile|nik|idcard|npwp|bank|account|address|passport|ssn)/i;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_PATTERN = /(?:\+62|62|0)8\d{7,12}\b/g;
const ID_NUMBER_PATTERN = /\b\d{15,16}\b/g;
const REDACTED = "[REDACTED]";

const redactString = (value: string): string =>
	value
		.replace(EMAIL_PATTERN, REDACTED)
		.replace(PHONE_PATTERN, REDACTED)
		.replace(ID_NUMBER_PATTERN, REDACTED);

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
