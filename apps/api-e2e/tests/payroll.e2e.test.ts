import type {
	TEmployee,
	TEmployeeCreateInput,
	TPayrollBankRow,
	TPayrollComponent,
	TPayrollItem,
	TPayrollItemList,
	TPayrollPayslip,
	TPayrollPeriod,
	TPayrollPeriodCreateInput,
	TTaxSimulationResult,
} from "@app/schemas";
import { beforeAll, describe, expect, it } from "vitest";
import { apiFetch, apiJson } from "../support/api-fetch.ts";
import { SEED_CREDENTIALS, signIn } from "../support/sign-in.ts";

const EMPLOYEE: TEmployeeCreateInput = {
	employeeCode: "E2E-PAY-001",
	idCardNumber: "3171010101900003",
	fullName: "E2E Payroll",
	email: "e2e-payroll@test.app",
	gender: "male",
	dateOfBirth: "1991-03-03",
	department: "Finance",
	position: "Finance Staff",
	employmentStatus: "permanent",
	workScheduleType: "5_days",
	workStartTime: "08:00",
	workEndTime: "17:00",
	joinDate: "2025-01-01",
	basicSalary: 10_000_000,
	taxMethod: "gross",
	ptkpCode: "TK/0",
	jkkRiskGrade: 1,
	pdpConsentGiven: true,
};

const PERIOD: TPayrollPeriodCreateInput = {
	name: "E2E Payroll November 2026",
	month: 11,
	year: 2026,
	startDate: "2026-11-01",
	endDate: "2026-11-30",
	payDate: "2026-11-25",
};

let adminCookie = "";
let employee: TEmployee;

beforeAll(async (): Promise<void> => {
	adminCookie = await signIn(SEED_CREDENTIALS.admin);
	employee = await apiJson<TEmployee>({
		path: "/employees",
		cookie: adminCookie,
		method: "POST",
		body: EMPLOYEE,
	});
});

describe("payroll REST endpoints", () => {
	it("creates and calculates a period for selected employees", async (): Promise<void> => {
		const created = await apiJson<TPayrollPeriod>({
			path: "/payroll/periods",
			cookie: adminCookie,
			method: "POST",
			body: PERIOD,
		});
		expect(created.status).toBe("draft");
		expect(created.totalEmployees).toBe(0);

		const calculated = await apiJson<TPayrollPeriod>({
			path: "/payroll/calculate",
			cookie: adminCookie,
			method: "POST",
			body: { periodId: created.id, employeeIds: [employee.id] },
		});
		expect(calculated.status).toBe("calculating");
		expect(calculated.totalEmployees).toBe(1);
		expect(calculated.totalGross).toBeGreaterThan(0);
		expect(calculated.totalPph21).toBeGreaterThan(0);
		expect(calculated.totalNetPay).toBeGreaterThan(0);

		const period = await apiJson<TPayrollPeriod>({
			path: `/payroll/periods/${created.id}`,
			cookie: adminCookie,
		});
		expect(period.id).toBe(created.id);

		const items = await apiJson<TPayrollItemList>({
			path: `/payroll/items?periodId=${created.id}&page=1&pageSize=20`,
			cookie: adminCookie,
		});
		expect(items.total).toBe(1);
		const item = items.items[0] as TPayrollItem;
		expect(item.employeeId).toBe(employee.id);
		expect(item.basicSalary).toBe(10_000_000);
		expect(item.netPay).toBeGreaterThan(0);
	});

	it("runs the payroll status lifecycle and rejects an invalid transition", async (): Promise<void> => {
		const period = await apiJson<TPayrollPeriod>({
			path: "/payroll/periods",
			cookie: adminCookie,
			method: "POST",
			body: { ...PERIOD, name: "E2E Payroll Lifecycle 2026" },
		});

		await apiJson<TPayrollPeriod>({
			path: "/payroll/calculate",
			cookie: adminCookie,
			method: "POST",
			body: { periodId: period.id, employeeIds: [employee.id] },
		});

		const approved = await apiJson<TPayrollPeriod>({
			path: `/payroll/periods/${period.id}/status`,
			cookie: adminCookie,
			method: "PATCH",
			body: { id: period.id, status: "approved" },
		});
		expect(approved.status).toBe("approved");

		const paid = await apiJson<TPayrollPeriod>({
			path: `/payroll/periods/${period.id}/status`,
			cookie: adminCookie,
			method: "PATCH",
			body: { id: period.id, status: "paid" },
		});
		expect(paid.status).toBe("paid");

		const locked = await apiJson<TPayrollPeriod>({
			path: `/payroll/periods/${period.id}/status`,
			cookie: adminCookie,
			method: "PATCH",
			body: { id: period.id, status: "locked" },
		});
		expect(locked.status).toBe("locked");

		const invalid = await apiFetch({
			path: `/payroll/periods/${period.id}/status`,
			cookie: adminCookie,
			method: "PATCH",
			body: { id: period.id, status: "approved" },
		});
		expect(invalid.status).toBe(409);
	});

	it("adds payroll components, includes them in calculation, and exposes payslip and bank export", async (): Promise<void> => {
		const period = await apiJson<TPayrollPeriod>({
			path: "/payroll/periods",
			cookie: adminCookie,
			method: "POST",
			body: { ...PERIOD, name: "E2E Payroll Components 2026" },
		});

		const componentInputs = [
			{ type: "allowance", amount: 1_000_000 },
			{ type: "bonus", amount: 2_000_000 },
			{ type: "natura", amount: 500_000 },
			{ type: "deduction", amount: 300_000 },
			{ type: "thr", amount: 3_000_000 },
		] as const;

		const components: TPayrollComponent[] = [];
		for (const component of componentInputs) {
			const created = await apiJson<TPayrollComponent>({
				path: "/payroll/components",
				cookie: adminCookie,
				method: "POST",
				body: {
					payrollPeriodId: period.id,
					employeeId: employee.id,
					...component,
				},
			});
			components.push(created);
		}

		const listedComponents = await apiJson<TPayrollComponent[]>({
			path: `/payroll/components?periodId=${period.id}`,
			cookie: adminCookie,
		});
		expect(listedComponents).toHaveLength(componentInputs.length);

		await apiJson<TPayrollPeriod>({
			path: "/payroll/calculate",
			cookie: adminCookie,
			method: "POST",
			body: { periodId: period.id, employeeIds: [employee.id] },
		});

		const items = await apiJson<TPayrollItemList>({
			path: `/payroll/items?periodId=${period.id}&page=1&pageSize=20`,
			cookie: adminCookie,
		});
		const item = items.items[0] as TPayrollItem;
		expect(item.allowanceTotal).toBe(1_000_000);
		expect(item.bonusTotal).toBe(5_000_000);
		expect(item.naturaTotal).toBe(500_000);
		expect(item.deductionTotal).toBeGreaterThanOrEqual(300_000);

		const itemById = await apiJson<TPayrollItem>({
			path: `/payroll/items/${item.id}`,
			cookie: adminCookie,
		});
		expect(itemById.id).toBe(item.id);

		const payslip = await apiJson<TPayrollPayslip>({
			path: `/payroll/items/${item.id}/payslip`,
			cookie: adminCookie,
		});
		expect(payslip.item.id).toBe(item.id);
		expect(payslip.components).toHaveLength(componentInputs.length);

		const reportItems = await apiJson<TPayrollItem[]>({
			path: `/payroll/periods/${period.id}/report-items`,
			cookie: adminCookie,
		});
		expect(reportItems).toHaveLength(1);
		expect(reportItems[0]?.id).toBe(item.id);

		const sentPayslip = await apiFetch({
			path: `/payroll/items/${item.id}/payslip/send`,
			cookie: adminCookie,
			method: "POST",
			body: { id: item.id },
		});
		expect(sentPayslip.status).toBe(200);

		const bankRows = await apiJson<TPayrollBankRow[]>({
			path: `/payroll/periods/${period.id}/bank-export`,
			cookie: adminCookie,
		});
		const bankRow = bankRows.find((row) => row.employeeId === employee.id);
		expect(bankRow?.employeeCode).toBe(EMPLOYEE.employeeCode);
		expect(bankRow?.netPay).toBe(item.netPay);

		for (const component of components) {
			const deleted = await apiFetch({
				path: `/payroll/components/${component.id}`,
				cookie: adminCookie,
				method: "DELETE",
			});
			expect(deleted.status).toBe(200);
		}
	});

	it("simulates PPh 21 TER take-home pay", async (): Promise<void> => {
		const result = await apiJson<TTaxSimulationResult>({
			path: "/payroll/simulate",
			cookie: adminCookie,
			method: "POST",
			body: {
				basicSalary: 10_000_000,
				ptkpCode: "TK/0",
				taxMethod: "gross",
				allowances: 0,
				overtimeHours: 0,
				bonus: 0,
				natura: 0,
				jkkRiskGrade: 1,
				month: 1,
				ytdGrossJanToNov: 0,
				ytdPph21JanToNov: 0,
			},
		});
		expect(result.takeHomePay).toBeGreaterThan(0);
		expect(result.tax.terCategory).toBe("TER_A");
	});

	it("is forbidden for a viewer", async (): Promise<void> => {
		const viewerCookie = await signIn(SEED_CREDENTIALS.viewer);
		const response = await apiFetch({
			path: "/payroll/periods?page=1&pageSize=20",
			cookie: viewerCookie,
		});
		expect(response.status).toBe(403);
	});
});
