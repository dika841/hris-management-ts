import { MAIL_MESSAGE } from "@app/messages";
import { mailHtmlBuild, mailTextBuild } from "./mail-body.ts";
import type { TMailMessage } from "./mailer.ts";

export type TLeaveStatusMailInput = {
	to: string;
	name: string;
	approved: boolean;
	leaveTypeName: string;
	startDate: string;
	endDate: string;
	note?: string | null;
};

export const leaveStatusMailBuild = (
	input: TLeaveStatusMailInput,
): TMailMessage => {
	const statusText = input.approved
		? MAIL_MESSAGE.LEAVE_STATUS_APPROVED
		: MAIL_MESSAGE.LEAVE_STATUS_REJECTED;
	const detail = [
		`${input.leaveTypeName}: ${input.startDate} - ${input.endDate}`,
		input.note ?? "",
	].filter(Boolean);

	return {
		to: input.to,
		subject: `${MAIL_MESSAGE.LEAVE_STATUS_SUBJECT} - ${statusText}`,
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
