import { MAIL_MESSAGE } from "@app/messages";
import { mailHtmlBuild, mailTextBuild } from "./mail-body.ts";
import type { TMailMessage } from "./mailer.ts";

export type TContractExpiryMailInput = {
	to: string;
	name: string;
	contractNumber: string;
	endDate: string;
	daysLeft: number;
};

export const contractExpiryMailBuild = (
	input: TContractExpiryMailInput,
): TMailMessage => {
	const detail = [
		`${MAIL_MESSAGE.CONTRACT_EXPIRY_BODY}`,
		`Kontrak: ${input.contractNumber}`,
		`Berakhir: ${input.endDate} (${input.daysLeft} hari lagi)`,
	];

	return {
		to: input.to,
		subject: MAIL_MESSAGE.CONTRACT_EXPIRY_SUBJECT,
		text: mailTextBuild([
			`${MAIL_MESSAGE.GREETING} ${input.name},`,
			...detail,
			MAIL_MESSAGE.SIGNATURE,
		]),
		html: mailHtmlBuild([
			`${MAIL_MESSAGE.GREETING} ${input.name},`,
			...detail,
			MAIL_MESSAGE.SIGNATURE,
		]),
	};
};
