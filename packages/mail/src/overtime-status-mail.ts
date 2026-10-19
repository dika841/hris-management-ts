import { MAIL_MESSAGE } from "@app/messages";
import { mailHtmlBuild, mailTextBuild } from "./mail-body.ts";
import type { TMailMessage } from "./mailer.ts";

export type TOvertimeStatusMailInput = {
	to: string;
	name: string;
	approved: boolean;
	overtimeDate: string;
	durationMinutes: number;
	note?: string | null;
};

export const overtimeStatusMailBuild = (
	input: TOvertimeStatusMailInput,
): TMailMessage => {
	const statusText = input.approved
		? MAIL_MESSAGE.OVERTIME_STATUS_APPROVED
		: MAIL_MESSAGE.OVERTIME_STATUS_REJECTED;
	const detail = [
		`${input.overtimeDate} (${input.durationMinutes} menit)`,
		input.note ?? "",
	].filter(Boolean);

	return {
		to: input.to,
		subject: `${MAIL_MESSAGE.OVERTIME_STATUS_SUBJECT} - ${statusText}`,
		text: mailTextBuild([
			`${MAIL_MESSAGE.GREETING} ${input.name},`,
			statusText,
			...detail,
			MAIL_MESSAGE.SIGNATURE,
		]),
		html: mailHtmlBuild([
			`${MAIL_MESSAGE.GREETING} ${input.name},`,
			statusText,
			...detail,
			MAIL_MESSAGE.SIGNATURE,
		]),
	};
};
