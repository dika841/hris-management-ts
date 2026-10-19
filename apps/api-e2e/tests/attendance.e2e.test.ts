import {
	LEAVE_CODE,
	type TAttendanceList,
	type TAttendanceLog,
	type TAttendanceSummary,
	type TEmployee,
	type TEmployeeCreateInput,
	type TLeaveBalance,
	type TLeaveRequest,
	type TLeaveType,
	type TOvertimeCalculation,
	type TOvertimeRequest,
	type TPublicHoliday,
} from "@app/schemas";
import { beforeAll, describe, expect, it } from "vitest";
import { apiFetch, apiJson } from "../support/api-fetch.ts";
import { SEED_CREDENTIALS, signIn } from "../support/sign-in.ts";

const EMPLOYEE: TEmployeeCreateInput = {
	employeeCode: "E2E-ATT-001",
	idCardNumber: "3171010101900002",
	fullName: "E2E Attendance",
	email: "e2e-attendance@test.app",
	gender: "female",
	dateOfBirth: "1992-02-02",
	department: "Human Resources",
	position: "HR Officer",
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
let employee: TEmployee;
let annualLeaveType: TLeaveType;

beforeAll(async (): Promise<void> => {
	adminCookie = await signIn(SEED_CREDENTIALS.admin);
	employee = await apiJson<TEmployee>({
		path: "/employees",
		cookie: adminCookie,
		method: "POST",
		body: EMPLOYEE,
	});

	const leaveTypes = await apiJson<TLeaveType[]>({
		path: "/leave/types",
		cookie: adminCookie,
	});
	annualLeaveType = leaveTypes.find(
		(type) => type.code === LEAVE_CODE.ANNUAL,
	) as TLeaveType;
});

describe("attendance REST endpoints", () => {
	it("logs attendance against the employee schedule and returns a monthly summary", async (): Promise<void> => {
		await apiFetch({
			path: `/employees/${employee.id}`,
			cookie: adminCookie,
			method: "PATCH",
			body: { workStartTime: "08:30", workEndTime: "17:30" },
		});

		const logResponse = await apiFetch({
			path: "/attendance",
			cookie: adminCookie,
			method: "POST",
			body: {
				employeeId: employee.id,
				attendanceDate: "2026-10-01",
				checkIn: "2026-10-01T08:45:00+07:00",
				checkOut: "2026-10-01T17:45:00+07:00",
				status: "present",
			},
		});
		expect(logResponse.status).toBe(200);
		const log = (await logResponse.json()) as TAttendanceLog;
		expect(log.lateMinutes).toBe(15);
		expect(log.earlyDepartureMinutes).toBe(0);
		expect(log.effectiveWorkMinutes).toBe(540);

		const correctedResponse = await apiFetch({
			path: "/attendance",
			cookie: adminCookie,
			method: "POST",
			body: {
				employeeId: employee.id,
				attendanceDate: "2026-10-01",
				checkIn: "2026-10-01T08:50:00+07:00",
				checkOut: "2026-10-01T17:50:00+07:00",
				status: "present",
			},
		});
		expect(correctedResponse.status).toBe(200);
		const corrected = (await correctedResponse.json()) as TAttendanceLog;
		expect(corrected.id).toBe(log.id);
		expect(corrected.lateMinutes).toBe(20);
		expect(corrected.effectiveWorkMinutes).toBe(540);

		const list = await apiJson<TAttendanceList>({
			path: `/attendance?page=1&pageSize=20&employeeId=${employee.id}&month=10&year=2026`,
			cookie: adminCookie,
		});
		expect(list.items.some((item) => item.id === log.id)).toBe(true);

		const summary = await apiJson<TAttendanceSummary>({
			path: `/attendance/summary?employeeId=${employee.id}&month=10&year=2026`,
			cookie: adminCookie,
		});
		expect(summary.totalPresent).toBe(1);
		expect(summary.totalLateMinutes).toBe(20);
	});

	it("creates and approves a paid leave request and updates the balance", async (): Promise<void> => {
		const balanceResponse = await apiFetch({
			path: "/leave/balances",
			cookie: adminCookie,
			method: "POST",
			body: {
				employeeId: employee.id,
				leaveTypeId: annualLeaveType.id,
				year: 2026,
				allocatedDays: 12,
			},
		});
		expect(balanceResponse.status).toBe(200);
		const balance = (await balanceResponse.json()) as TLeaveBalance;
		expect(balance.allocatedDays).toBe(12);

		const leaveResponse = await apiFetch({
			path: "/leave/requests",
			cookie: adminCookie,
			method: "POST",
			body: {
				employeeId: employee.id,
				leaveTypeId: annualLeaveType.id,
				startDate: "2026-10-05",
				endDate: "2026-10-06",
				reason: "E2E annual leave",
			},
		});
		expect(leaveResponse.status).toBe(200);
		const leave = (await leaveResponse.json()) as TLeaveRequest;
		expect(leave.status).toBe("pending");
		expect(leave.totalDays).toBe(2);

		const approveResponse = await apiFetch({
			path: `/leave/requests/${leave.id}/approve`,
			cookie: adminCookie,
			method: "POST",
			body: { id: leave.id, notes: "Approved by E2E" },
		});
		expect(approveResponse.status).toBe(200);
		const approved = (await approveResponse.json()) as TLeaveRequest;
		expect(approved.status).toBe("approved");

		const balances = await apiJson<TLeaveBalance[]>({
			path: `/leave/balances?employeeId=${employee.id}&year=2026`,
			cookie: adminCookie,
		});
		const annual = balances.find(
			(item) => item.leaveTypeId === annualLeaveType.id,
		);
		expect(annual?.usedDays).toBe(2);
	});

	it("calculates, creates, and approves overtime", async (): Promise<void> => {
		const calculation = await apiJson<TOvertimeCalculation>({
			path: "/overtime/calculate",
			cookie: adminCookie,
			method: "POST",
			body: {
				employeeId: employee.id,
				overtimeDate: "2026-10-07",
				startTime: "18:00",
				endTime: "20:00",
				dayType: "workday",
				workScheduleType: "5_days",
			},
		});
		expect(calculation.durationMinutes).toBe(120);
		expect(calculation.totalAmount).toBeGreaterThan(0);
		expect(calculation.breakdown).toHaveLength(2);

		const createResponse = await apiFetch({
			path: "/overtime",
			cookie: adminCookie,
			method: "POST",
			body: {
				employeeId: employee.id,
				overtimeDate: "2026-10-07",
				startTime: "18:00",
				endTime: "20:00",
				dayType: "workday",
				workScheduleType: "5_days",
				reason: "E2E overtime",
			},
		});
		expect(createResponse.status).toBe(200);
		const overtime = (await createResponse.json()) as TOvertimeRequest;
		expect(overtime.status).toBe("pending");

		const approveResponse = await apiFetch({
			path: `/overtime/${overtime.id}/approve`,
			cookie: adminCookie,
			method: "POST",
			body: { id: overtime.id, notes: "Approved by E2E" },
		});
		expect(approveResponse.status).toBe(200);
		const approved = (await approveResponse.json()) as TOvertimeRequest;
		expect(approved.status).toBe("approved");
	});

	it("creates and deletes a public holiday", async (): Promise<void> => {
		const createResponse = await apiFetch({
			path: "/holidays",
			cookie: adminCookie,
			method: "POST",
			body: {
				date: "2026-12-31",
				name: "E2E Year End Holiday",
				type: "national",
			},
		});
		expect(createResponse.status).toBe(200);
		const holiday = (await createResponse.json()) as TPublicHoliday;

		const list = await apiJson<TPublicHoliday[]>({
			path: "/holidays?year=2026",
			cookie: adminCookie,
		});
		expect(list.some((item) => item.id === holiday.id)).toBe(true);

		const deleteResponse = await apiFetch({
			path: `/holidays/${holiday.id}`,
			cookie: adminCookie,
			method: "DELETE",
		});
		expect(deleteResponse.status).toBe(200);
	});

	it("is forbidden for a viewer", async (): Promise<void> => {
		const viewerCookie = await signIn(SEED_CREDENTIALS.viewer);
		const response = await apiFetch({
			path: "/attendance?page=1&pageSize=20",
			cookie: viewerCookie,
		});
		expect(response.status).toBe(403);
	});
});
