export const MAIL_MESSAGE = {
	GREETING: "Hi",
	SIGNATURE: "- Standard",
	PASSWORD_RESET_SUBJECT: "Reset your password",
	PASSWORD_RESET_BODY:
		"Someone asked to reset the password for your account. Use the link below to choose a new one.",
	PASSWORD_RESET_ACTION: "Reset password",
	PASSWORD_RESET_EXPIRY:
		"This link expires in one hour. If you did not ask for it, you can safely ignore this email.",
	SEND_FAILED: "Could not send an email.",
	PASSWORD_RESET_FAILED: "Could not send the password reset email.",
	LEAVE_STATUS_SUBJECT: "Leave request status",
	LEAVE_STATUS_APPROVED: "Your leave request has been approved.",
	LEAVE_STATUS_REJECTED: "Your leave request has been rejected.",
	OVERTIME_STATUS_SUBJECT: "Overtime request status",
	OVERTIME_STATUS_APPROVED: "Your overtime request has been approved.",
	OVERTIME_STATUS_REJECTED: "Your overtime request has been rejected.",
	CONTRACT_EXPIRY_SUBJECT: "Employment contract expiry reminder",
	CONTRACT_EXPIRY_BODY: "Your employment contract is approaching its end date.",
} as const;
