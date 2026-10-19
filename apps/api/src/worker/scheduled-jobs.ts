import {
	contractExpiryMailBuild,
	MAIL_TEMPLATE,
	mailSendSafe,
} from "@app/mail";
import { NOTIFICATION_TYPE } from "@app/schemas";
import { Effect } from "effect";
import { AttendanceRepo, type TAttendanceRepoId } from "#/attendance/index.ts";
import { EmployeeRepo, type TEmployeeRepoId } from "#/employee/index.ts";
import {
	notificationCreate,
	type TNotificationRepoId,
} from "#/notification/index.ts";
import { CacheService, type TCacheServiceId } from "#/platform/cache/redis.ts";
import { MailService, type TMailServiceId } from "#/platform/mail/mailer.ts";
import { logger } from "#/platform/observability/logger.ts";
import type { EDatabase } from "#/shared/errors.ts";

const MILLISECONDS_PER_DAY = 86_400_000;
const CONTRACT_WINDOW_DAYS = 60;
const CONTRACT_REMINDER_TTL_SECONDS = 7 * 24 * 60 * 60;
const CARRY_OVER_FORFEIT_MONTH = 7;

const daysUntil = (date: string): number =>
	Math.ceil(
		(new Date(`${date}T00:00:00Z`).getTime() - Date.now()) /
			MILLISECONDS_PER_DAY,
	);

export const contractExpiryRun = Effect.fn("contractExpiryRun")(
	function* (): Effect.fn.Return<
		{ checked: number; sent: number },
		EDatabase,
		TEmployeeRepoId | TMailServiceId | TCacheServiceId | TNotificationRepoId
	> {
		const employeeRepo = yield* EmployeeRepo;
		const { mailer } = yield* MailService;
		const { client } = yield* CacheService;

		const contracts =
			yield* employeeRepo.listExpiringContracts(CONTRACT_WINDOW_DAYS);
		let sent = 0;

		for (const contract of contracts) {
			if (contract.endDate === null) continue;
			const remaining = daysUntil(contract.endDate);
			if (remaining < 0 || remaining > CONTRACT_WINDOW_DAYS) continue;

			const bucket = remaining <= 30 ? "h30" : "h60";
			const key = `contract-expiry:${contract.id}:${bucket}`;
			const shouldSend = yield* Effect.promise(() =>
				client.setIfAbsent(key, CONTRACT_REMINDER_TTL_SECONDS, "1"),
			).pipe(Effect.catch(() => Effect.succeed(true)));
			if (!shouldSend) continue;

			const employee = yield* employeeRepo.findById(contract.employeeId);
			if (employee === null) continue;

			const delivered = yield* Effect.promise(() =>
				mailSendSafe(
					mailer,
					logger,
					MAIL_TEMPLATE.CONTRACT_EXPIRY,
					contractExpiryMailBuild({
						to: employee.email,
						name: employee.fullName,
						contractNumber: contract.contractNumber,
						endDate: contract.endDate ?? "-",
						daysLeft: remaining,
					}),
				),
			);
			if (delivered) sent += 1;

			if (employee.userId) {
				yield* notificationCreate({
					userId: employee.userId,
					type: NOTIFICATION_TYPE.CONTRACT_EXPIRY,
					title: "Employment contract expiring soon",
					body: `${contract.contractNumber} ends on ${contract.endDate} (${remaining} days left).`,
					link: `/employees/${employee.id}`,
				});
			}
		}

		logger.info(
			{ checked: contracts.length, sent },
			"contract expiry scheduled job finished",
		);

		return { checked: contracts.length, sent };
	},
);

export const leaveCarryOverRun = Effect.fn("leaveCarryOverRun")(
	function* (): Effect.fn.Return<
		{ forfeited: number; skipped: boolean },
		EDatabase,
		TAttendanceRepoId
	> {
		const now = new Date();
		if (now.getMonth() + 1 < CARRY_OVER_FORFEIT_MONTH) {
			return { forfeited: 0, skipped: true };
		}

		const attendanceRepo = yield* AttendanceRepo;
		const year = now.getFullYear();
		const forfeited = yield* attendanceRepo.forfeitExpiredCarryOver(year);

		logger.info({ year, forfeited }, "leave carry-over scheduled job finished");

		return { forfeited, skipped: false };
	},
);

export const scheduledJobsRun = Effect.fn("scheduledJobsRun")(function* () {
	yield* contractExpiryRun().pipe(
		Effect.catch((cause) =>
			Effect.sync(() => {
				logger.error({ err: cause }, "contract expiry scheduled job failed");
			}),
		),
	);
	yield* leaveCarryOverRun().pipe(
		Effect.catch((cause) =>
			Effect.sync(() => {
				logger.error({ err: cause }, "leave carry-over scheduled job failed");
			}),
		),
	);
});
