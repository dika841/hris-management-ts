import type {
	TEmployee,
	TEmployeeCareerHistory,
	TEmployeeContract,
	TEmployeeCreateInput,
	TEmployeeList,
	TEmployeeStats,
} from "@app/schemas";
import { expect, beforeAll, describe, it } from "vitest";
import { apiFetch, apiJson } from "../support/api-fetch.ts";
import { SEED_CREDENTIALS, signIn } from "../support/sign-in.ts";

const EMPLOYEE: TEmployeeCreateInput = {
	employeeCode: "E2E-EMP-001",
	idCardNumber: "3171010101900001",
	fullName: "E2E Employee",
	email: "e2e-employee@test.app",
	phone: "081234567890",
	gender: "male",
	dateOfBirth: "1990-01-01",
	department: "Engineering",
	position: "Software Engineer",
	employmentStatus: "permanent",
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

describe("employee REST endpoints", () => {
	it("creates, lists, reads, updates, and deletes an employee", async (): Promise<void> => {
		const createResponse = await apiFetch({
			path: "/employees",
			cookie: adminCookie,
			method: "POST",
			body: EMPLOYEE,
		});
		expect(createResponse.status).toBe(200);
		const created = (await createResponse.json()) as TEmployee;
		expect(created.employeeCode).toBe(EMPLOYEE.employeeCode);
		expect(created.pdpConsentGiven).toBe(true);

		const list = await apiJson<TEmployeeList>({
			path: `/employees?page=1&pageSize=50&search=${EMPLOYEE.employeeCode}`,
			cookie: adminCookie,
		});
		expect(list.items.some((item) => item.id === created.id)).toBe(true);

		const get = await apiJson<TEmployee>({
			path: `/employees/${created.id}`,
			cookie: adminCookie,
		});
		expect(get.fullName).toBe(EMPLOYEE.fullName);

		const updateResponse = await apiFetch({
			path: `/employees/${created.id}`,
			cookie: adminCookie,
			method: "PATCH",
			body: {
				position: "Senior Software Engineer",
				basicSalary: 12_000_000,
			},
		});
		expect(updateResponse.status).toBe(200);
		const updated = (await updateResponse.json()) as TEmployee;
		expect(updated.position).toBe("Senior Software Engineer");
		expect(updated.basicSalary).toBe(12_000_000);

		const stats = await apiJson<TEmployeeStats>({
			path: "/employees/stats",
			cookie: adminCookie,
		});
		expect(stats.total).toBeGreaterThan(0);

		const careerResponse = await apiFetch({
			path: "/employees/career",
			cookie: adminCookie,
			method: "POST",
			body: {
				employeeId: created.id,
				changeType: "promotion",
				effectiveDate: "2026-01-01",
				newDepartment: "Engineering",
				newPosition: "Engineering Lead",
				newSalary: 15_000_000,
				notes: "E2E promotion",
			},
		});
		expect(careerResponse.status).toBe(200);
		const career = (await careerResponse.json()) as TEmployeeCareerHistory;
		expect(career.changeType).toBe("promotion");

		const careerList = await apiJson<TEmployeeCareerHistory[]>({
			path: `/employees/career?employeeId=${created.id}`,
			cookie: adminCookie,
		});
		expect(careerList).toHaveLength(1);
		expect(careerList[0]?.newSalary).toBe(15_000_000);

		const afterCareer = await apiJson<TEmployee>({
			path: `/employees/${created.id}`,
			cookie: adminCookie,
		});
		expect(afterCareer.position).toBe("Engineering Lead");
		expect(afterCareer.basicSalary).toBe(15_000_000);

		const contractResponse = await apiFetch({
			path: "/employees/contracts",
			cookie: adminCookie,
			method: "POST",
			body: {
				employeeId: created.id,
				contractType: "pkwt",
				contractNumber: "E2E-CTR-001",
				startDate: "2026-01-01",
				endDate: "2027-12-31",
				basicSalary: 16_000_000,
				fixedAllowance: 500_000,
				position: "Engineering Lead",
				department: "Engineering",
			},
		});
		expect(contractResponse.status).toBe(200);
		const contract = (await contractResponse.json()) as TEmployeeContract;
		expect(contract.contractNumber).toBe("E2E-CTR-001");

		const deleteResponse = await apiFetch({
			path: `/employees/${created.id}`,
			cookie: adminCookie,
			method: "DELETE",
		});
		expect(deleteResponse.status).toBe(200);
	});

	it("is forbidden for a viewer", async (): Promise<void> => {
		const viewerCookie = await signIn(SEED_CREDENTIALS.viewer);
		const response = await apiFetch({
			path: "/employees?page=1&pageSize=20",
			cookie: viewerCookie,
		});
		expect(response.status).toBe(403);
	});
});
