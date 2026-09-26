import type {
	TContractStatus,
	TContractType,
	TEmployeeCreateInput,
	TEmployeeListInput,
	TEmployeeUpdateInput,
	TEmploymentStatus,
	TGender,
	TPtkpCode,
	TTaxMethod,
} from "@app/schemas";
import { Context, type Effect } from "effect";
import type { TBaseRow } from "#/shared/base-row.ts";
import type { EDatabase } from "#/shared/errors.ts";
import type { TRowPage } from "#/shared/pagination.ts";
import { REPO_TAG } from "#/shared/repo-tags.ts";
import type { TServiceId } from "#/shared/service-id.ts";

export type TEmployeeRow = TBaseRow & {
	userId: string | null;
	employeeCode: string;
	idCardNumber: string;
	fullName: string;
	email: string;
	phone: string | null;
	gender: TGender;
	dateOfBirth: string;
	department: string;
	position: string;
	employmentStatus: TEmploymentStatus;
	joinDate: string;
	endDate: string | null;
	managerId: string | null;
	basicSalary: number;
	taxMethod: TTaxMethod;
	ptkpCode: TPtkpCode;
	npwp: string | null;
	bankName: string | null;
	bankAccountNumber: string | null;
	bankAccountHolder: string | null;
	bpjsKesehatanNumber: string | null;
	bpjsKetenagakerjaanNumber: string | null;
	jkkRiskGrade: number;
	pdpConsentGiven: boolean;
	pdpConsentDate: Date | null;
};

export type TEmployeeContractRow = TBaseRow & {
	employeeId: string;
	contractType: TContractType;
	contractNumber: string;
	startDate: string;
	endDate: string | null;
	probationEndDate: string | null;
	basicSalary: number;
	fixedAllowance: number;
	position: string;
	department: string;
	status: TContractStatus;
	compensationAmount: number;
	compensationPaid: boolean;
	compensationPaidAt: Date | null;
	documentUrl: string | null;
	notes: string | null;
};

export type TDepartmentRow = TBaseRow & {
	code: string;
	name: string;
	description: string | null;
};

export type TPositionRow = TBaseRow & {
	departmentId: string | null;
	code: string;
	title: string;
};

export type TEmployeeRepo = {
	list: (
		input: TEmployeeListInput,
	) => Effect.Effect<TRowPage<TEmployeeRow>, EDatabase>;
	findById: (id: string) => Effect.Effect<TEmployeeRow | null, EDatabase>;
	findByCode: (code: string) => Effect.Effect<TEmployeeRow | null, EDatabase>;
	findByEmail: (email: string) => Effect.Effect<TEmployeeRow | null, EDatabase>;
	create: (input: TEmployeeCreateInput) => Effect.Effect<TEmployeeRow, EDatabase>;
	update: (
		input: TEmployeeUpdateInput,
	) => Effect.Effect<TEmployeeRow | null, EDatabase>;
	remove: (id: string) => Effect.Effect<boolean, EDatabase>;

	// Contracts
	listContracts: (
		employeeId: string,
	) => Effect.Effect<readonly TEmployeeContractRow[], EDatabase>;
	findContractById: (
		id: string,
	) => Effect.Effect<TEmployeeContractRow | null, EDatabase>;
	createContract: (
		data: Omit<TEmployeeContractRow, "id" | "createdAt" | "updatedAt">,
	) => Effect.Effect<TEmployeeContractRow, EDatabase>;
	updateContract: (
		id: string,
		patch: Partial<TEmployeeContractRow>,
	) => Effect.Effect<TEmployeeContractRow | null, EDatabase>;
	listExpiringContracts: (
		days: number,
	) => Effect.Effect<readonly TEmployeeContractRow[], EDatabase>;

	// Organization
	listDepartments: () => Effect.Effect<readonly TDepartmentRow[], EDatabase>;
	createDepartment: (data: {
		code: string;
		name: string;
		description?: string;
	}) => Effect.Effect<TDepartmentRow, EDatabase>;
	listPositions: () => Effect.Effect<readonly TPositionRow[], EDatabase>;
	createPosition: (data: {
		departmentId?: string;
		code: string;
		title: string;
	}) => Effect.Effect<TPositionRow, EDatabase>;
};

export type TEmployeeRepoId = TServiceId<typeof REPO_TAG.EMPLOYEE>;

export const EmployeeRepo = Context.Service<TEmployeeRepoId, TEmployeeRepo>(
	REPO_TAG.EMPLOYEE,
);
