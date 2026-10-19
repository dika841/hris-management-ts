import { ROLE } from "@app/permissions";
import type {
	TEmployee,
	TEmployeeCreateInput,
	TMe,
	TNotificationList,
	TNotificationUnreadCount,
	TOvertimeRequest,
	TUser,
	TUserCreateInput,
} from "@app/schemas";
import { beforeAll, describe, expect, it } from "vitest";
import { apiFetch, apiJson } from "../support/api-fetch.ts";
import { SEED_CREDENTIALS, signIn } from "../support/sign-in.ts";

const USER: TUserCreateInput = {
	name: "E2E Notification User",
	email: "e2e-notification@test.app",
	password: "notification-password-123",
	role: ROLE.MEMBER,
};

const EMPLOYEE: TEmployeeCreateInput = {
	employeeCode: "E2E-NOTIF-EMP",
	idCardNumber: "3171010101900088",
	fullName: "E2E Notification Employee",
	email: "e2e-notification-employee@test.app",
	gender: "male",
	dateOfBirth: "1990-01-01",
	department: "Engineering",
	position: "Software Engineer",
	employmentStatus: "permanent",
	workScheduleType: "5_days",
	workStartTime: "08:00",
	workEndTime: "17:00",
	joinDate: "2024-01-01",
	basicSalary: 10_000_000,
	taxMethod: "gross",
	ptkpCode: "TK/0",
	jkkRiskGrade: 1,
	pdpConsentGiven: true,
};

let adminCookie = "";

beforeAll(async (): Promise<void> => {
	adminCookie = await signIn(SEED_CREDENTIALS.admin);
});

describe("in-app notification endpoints", () => {
	it("creates a notification for an overtime decision and lets the recipient read it", async (): Promise<void> => {
		const user = await apiJson<TUser>({
			path: "/users",
			cookie: adminCookie,
			method: "POST",
			body: USER,
		});

		const employee = await apiJson<TEmployee>({
			path: "/employees",
			cookie: adminCookie,
			method: "POST",
			body: { ...EMPLOYEE, userId: user.id },
		});

		const overtime = await apiJson<TOvertimeRequest>({
			path: "/overtime",
			cookie: adminCookie,
			method: "POST",
			body: {
				employeeId: employee.id,
				overtimeDate: "2026-10-08",
				startTime: "18:00",
				endTime: "20:00",
				dayType: "workday",
				workScheduleType: "5_days",
				reason: "E2E notification overtime",
			},
		});

		await apiFetch({
			path: `/overtime/${overtime.id}/approve`,
			cookie: adminCookie,
			method: "POST",
			body: { id: overtime.id },
		});

		const userCookie = await signIn({
			email: USER.email,
			password: USER.password,
		});

		const list = await apiJson<TNotificationList>({
			path: "/notifications?page=1&pageSize=20",
			cookie: userCookie,
		});
		const notification = list.items.find(
			(item) => item.type === "overtime_status",
		);
		expect(notification).toBeDefined();
		expect(notification?.readAt).toBeNull();

		const unreadBefore = await apiJson<TNotificationUnreadCount>({
			path: "/notifications/unread-count",
			cookie: userCookie,
		});
		expect(unreadBefore.count).toBeGreaterThan(0);

		const marked = await apiFetch({
			path: `/notifications/${notification?.id}/read`,
			cookie: userCookie,
			method: "PATCH",
			body: { id: notification?.id },
		});
		expect(marked.status).toBe(200);

		const unreadAfter = await apiJson<TNotificationUnreadCount>({
			path: "/notifications/unread-count",
			cookie: userCookie,
		});
		expect(unreadAfter.count).toBe(unreadBefore.count - 1);

		const markedAll = await apiFetch({
			path: "/notifications/read-all",
			cookie: userCookie,
			method: "POST",
		});
		expect(markedAll.status).toBe(200);

		const unreadFinal = await apiJson<TNotificationUnreadCount>({
			path: "/notifications/unread-count",
			cookie: userCookie,
		});
		expect(unreadFinal.count).toBe(0);

		const me = await apiJson<TMe>({ path: "/me", cookie: adminCookie });
		expect(me.user.id).not.toBe("");

		await apiFetch({
			path: `/employees/${employee.id}`,
			cookie: adminCookie,
			method: "DELETE",
		});
		await apiFetch({
			path: `/users/${user.id}`,
			cookie: adminCookie,
			method: "DELETE",
		});
	});
});
