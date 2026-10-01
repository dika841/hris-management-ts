import {
	CONTRACT_STATUS,
	CONTRACT_TYPE,
	type TContractCreateInput,
} from "@app/schemas";
import { Effect, Layer } from "effect";
import { describe, expect, it, vi } from "vitest";
import { contractCreate } from "#/employee/application/contract-create.ts";
import {
	EmployeeRepo,
	type TEmployeeContractRow,
	type TEmployeeRepo,
	type TEmployeeRow,
} from "#/employee/domain/employee.ts";
import { ActivityRecorder } from "#/shared/activity-recorder.ts";
import { EConflict } from "#/shared/errors.ts";

const ACTOR_ID = "22222222-2222-4222-8222-222222222222";
const EMP_ID = "11111111-1111-4111-8111-111111111111";

const mockEmployee: TEmployeeRow = {
	id: EMP_ID,
	userId: null,
	employeeCode: "EMP001",
	idCardNumber: "3201234567890001",
	fullName: "Budi Santoso",
	email: "budi@perusahaan.co.id",
	phone: "081234567890",
	gender: "male",
	dateOfBirth: "1990-01-01",
	department: "Engineering",
	position: "Software Engineer",
	employmentStatus: "contract",
	joinDate: "2024-01-01",
	endDate: "2025-01-01",
	managerId: null,
	basicSalary: 10_000_000,
	taxMethod: "gross",
	ptkpCode: "TK/0",
	npwp: null,
	bankName: null,
	bankAccountNumber: null,
	bankAccountHolder: null,
	bpjsKesehatanNumber: null,
	bpjsKetenagakerjaanNumber: null,
	jkkRiskGrade: 1,
	pdpConsentGiven: true,
	pdpConsentDate: new Date(),
	createdAt: new Date(),
	updatedAt: new Date(),
};

const mockContractRow: TEmployeeContractRow = {
	id: "33333333-3333-4333-8333-333333333333",
	employeeId: EMP_ID,
	contractType: CONTRACT_TYPE.PKWT,
	contractNumber: "001/PKWT/2024",
	startDate: "2024-01-01",
	endDate: "2025-01-01",
	probationEndDate: null,
	basicSalary: 10_000_000,
	fixedAllowance: 0,
	position: "Software Engineer",
	department: "Engineering",
	status: CONTRACT_STATUS.ACTIVE,
	compensationAmount: 10_000_000,
	compensationPaid: false,
	compensationPaidAt: null,
	documentUrl: null,
	notes: null,
	createdAt: new Date(),
	updatedAt: new Date(),
};

describe("contractCreate", () => {
	it("rejects PKWT contracts that specify a probationary period per PP 35/2021", async () => {
		const repo = {
			findById: vi.fn().mockReturnValue(Effect.succeed(mockEmployee)),
			listContracts: vi.fn().mockReturnValue(Effect.succeed([])),
			createContract: vi.fn(),
			update: vi.fn(),
		};
		const layer = Layer.mergeAll(
			Layer.succeed(
				EmployeeRepo,
				EmployeeRepo.of(repo as unknown as TEmployeeRepo),
			),
			Layer.succeed(
				ActivityRecorder,
				ActivityRecorder.of({
					insert: vi.fn().mockReturnValue(Effect.succeed(undefined)),
				}),
			),
		);

		const input: TContractCreateInput = {
			employeeId: EMP_ID,
			contractType: CONTRACT_TYPE.PKWT,
			contractNumber: "001/PKWT/2024",
			startDate: "2024-01-01",
			endDate: "2025-01-01",
			probationEndDate: "2024-04-01", // Forbidden for PKWT!
			basicSalary: 10_000_000,
			fixedAllowance: 0,
			department: "Engineering",
			position: "Software Engineer",
		};

		const error = await Effect.runPromise(
			contractCreate(input, ACTOR_ID).pipe(Effect.provide(layer), Effect.flip),
		);

		expect(error).toBeInstanceOf(EConflict);
		expect((error as Error).message).toContain("PP 35/2021");
		expect(repo.createContract).not.toHaveBeenCalled();
	});

	it("creates PKWT contract and calculates legal compensation", async () => {
		const repo = {
			findById: vi.fn().mockReturnValue(Effect.succeed(mockEmployee)),
			listContracts: vi.fn().mockReturnValue(Effect.succeed([])),
			createContract: vi.fn().mockReturnValue(Effect.succeed(mockContractRow)),
			update: vi.fn().mockReturnValue(Effect.succeed(mockEmployee)),
		};
		const layer = Layer.mergeAll(
			Layer.succeed(
				EmployeeRepo,
				EmployeeRepo.of(repo as unknown as TEmployeeRepo),
			),
			Layer.succeed(
				ActivityRecorder,
				ActivityRecorder.of({
					insert: vi.fn().mockReturnValue(Effect.succeed(undefined)),
				}),
			),
		);

		const input: TContractCreateInput = {
			employeeId: EMP_ID,
			contractType: CONTRACT_TYPE.PKWT,
			contractNumber: "001/PKWT/2024",
			startDate: "2024-01-01",
			endDate: "2025-01-01",
			basicSalary: 10_000_000,
			fixedAllowance: 0,
			department: "Engineering",
			position: "Software Engineer",
		};

		const result = await Effect.runPromise(
			contractCreate(input, ACTOR_ID).pipe(Effect.provide(layer)),
		);

		expect(result.id).toBe(mockContractRow.id);
		expect(repo.createContract).toHaveBeenCalledWith(
			expect.objectContaining({
				contractType: "pkwt",
				compensationAmount: expect.any(Number),
			}),
		);
	});
});
