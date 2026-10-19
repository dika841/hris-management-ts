import { MAIL_MESSAGE } from "@app/messages";
import { mailHtmlBuild, mailLinkBuild, mailTextBuild } from "./mail-body.ts";
import type { TMailMessage } from "./mailer.ts";

export type TPayslipMailInput = {
	to: string;
	name: string;
	periodName: string;
	url: string;
};

export const payslipMailBuild = (input: TPayslipMailInput): TMailMessage => ({
	to: input.to,
	subject: `${MAIL_MESSAGE.PAYSLIP_SUBJECT} - ${input.periodName}`,
	text: mailTextBuild([
		`${MAIL_MESSAGE.GREETING} ${input.name},`,
		MAIL_MESSAGE.PAYSLIP_BODY,
		input.url,
		MAIL_MESSAGE.SIGNATURE,
	]),
	html: mailHtmlBuild([
		`${MAIL_MESSAGE.GREETING} ${input.name},`,
		MAIL_MESSAGE.PAYSLIP_BODY,
		mailLinkBuild(MAIL_MESSAGE.PAYSLIP_ACTION, input.url),
		MAIL_MESSAGE.SIGNATURE,
	]),
});
