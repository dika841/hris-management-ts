import type {
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
};

export type TEmployeeRepoId = TServiceId<typeof REPO_TAG.EMPLOYEE>;

export const EmployeeRepo = Context.Service<TEmployeeRepoId, TEmployeeRepo>(
	REPO_TAG.EMPLOYEE,
);
