import { ROLE } from "@app/permissions";
import type {
	TAttendanceLog,
	TEmployee,
	TEmployeeCreateInput,
	TLeaveRequest,
	TNotificationList,
	TOvertimeRequest,
	TSelfProfile,
	TUser,
	TUserCreateInput,
} from "@app/schemas";
import { beforeAll, describe, expect, it } from "vitest";
import { apiFetch, apiJson } from "../support/api-fetch.ts";
import { SEED_CREDENTIALS, signIn } from "../support/sign-in.ts";

const USER: TUserCreateInput = {
	name: "E2E Self User",
	email: "e2e-self@test.app",
	password: "self-password-123",
	role: ROLE.MEMBER,
};

const EMPLOYEE: TEmployeeCreateInput = {
	employeeCode: "E2E-SELF-EMP",
	idCardNumber: "3171010101900077",
	fullName: "E2E Self Employee",
	email: "e2e-self-employee@test.app",
	gender: "female",
	dateOfBirth: "1992-02-02",
	department: "Human Resources",
	position: "HR Officer",
	employmentStatus: "permanent",
	workScheduleType: "5_days",
	workStartTime: "08:00",
	workEndTime: "17:00",
	joinDate: "2024-01-01",
	basicSalary: 8_000_000,
	taxMethod: "gross",
	ptkpCode: "TK/0",
	jkkRiskGrade: 1,
	pdpConsentGiven: true,
};

let adminCookie = "";

beforeAll(async (): Promise<void> => {
	adminCookie = await signIn(SEED_CREDENTIALS.admin);
});

describe("self-service endpoints", () => {
	it("lets a linked user manage only their own attendance, leave, and overtime", async (): Promise<void> => {
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

		const leaveTypes = await apiJson<{ id: string; code: string }[]>({
			path: "/leave/types",
			cookie: adminCookie,
		});
		const annual = leaveTypes.find((item) => item.code === "annual");
		expect(annual).toBeDefined();
		await apiFetch({
			path: "/leave/balances",
			cookie: adminCookie,
			method: "POST",
			body: {
				employeeId: employee.id,
				leaveTypeId: annual?.id,
				year: 2026,
				allocatedDays: 12,
			},
		});

		const userCookie = await signIn({
			email: USER.email,
			password: USER.password,
		});

		const profile = await apiJson<TSelfProfile>({
			path: "/self/profile",
			cookie: userCookie,
		});
		expect(profile.linked).toBe(true);
		if (profile.linked) {
			expect(profile.employee.id).toBe(employee.id);
		}

		const clockIn = await apiJson<TAttendanceLog>({
			path: "/self/attendance/clock-in",
			cookie: userCookie,
			method: "POST",
		});
		expect(clockIn.employeeId).toBe(employee.id);

		const clockOut = await apiJson<TAttendanceLog>({
			path: "/self/attendance/clock-out",
			cookie: userCookie,
			method: "POST",
		});
		expect(clockOut.employeeId).toBe(employee.id);

		const leave = await apiJson<TLeaveRequest>({
			path: "/self/leave",
			cookie: userCookie,
			method: "POST",
			body: {
				leaveTypeId: annual?.id,
				startDate: "2026-11-02",
				endDate: "2026-11-03",
				reason: "E2E self leave",
			},
		});
		expect(leave.employeeId).toBe(employee.id);
		expect(leave.status).toBe("pending");

		const cancelledLeave = await apiFetch({
			path: `/self/leave/${leave.id}/cancel`,
			cookie: userCookie,
			method: "POST",
			body: { id: leave.id },
		});
		expect(cancelledLeave.status).toBe(200);

		const overtime = await apiJson<TOvertimeRequest>({
			path: "/self/overtime",
			cookie: userCookie,
			method: "POST",
			body: {
				overtimeDate: "2026-10-09",
				startTime: "18:00",
				endTime: "20:00",
				dayType: "workday",
				workScheduleType: "5_days",
				reason: "E2E self overtime",
			},
		});
		expect(overtime.employeeId).toBe(employee.id);

		const cancelledOvertime = await apiFetch({
			path: `/self/overtime/${overtime.id}/cancel`,
			cookie: userCookie,
			method: "POST",
			body: { id: overtime.id },
		});
		expect(cancelledOvertime.status).toBe(200);

		const payslips = await apiJson<unknown[]>({
			path: "/self/payslips",
			cookie: userCookie,
		});
		expect(Array.isArray(payslips)).toBe(true);

		const notifications = await apiJson<TNotificationList>({
			path: "/notifications?page=1&pageSize=20",
			cookie: userCookie,
		});
		expect(Array.isArray(notifications.items)).toBe(true);

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

	it("reports an unlinked account without exposing data", async (): Promise<void> => {
		const viewerCookie = await signIn(SEED_CREDENTIALS.viewer);
		const profile = await apiJson<TSelfProfile>({
			path: "/self/profile",
			cookie: viewerCookie,
		});
		expect(profile.linked).toBe(false);

		const attendance = await apiFetch({
			path: "/self/attendance?page=1&pageSize=20",
			cookie: viewerCookie,
		});
		expect(attendance.status).toBe(409);
	});
});
