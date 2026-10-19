import type {
	TBpjsBreakdown,
	TPayrollCalculateInput,
	TPayrollComponentType,
	TPayrollItemListInput,
	TPayrollPeriodCreateInput,
	TPayrollPeriodListInput,
	TPayrollPeriodStatus,
	TPayrollPeriodUpdateInput,
	TTaxBreakdown,
} from "@app/schemas";
import { Context, type Effect } from "effect";
import type { TBaseRow } from "#/shared/base-row.ts";
import type { EDatabase } from "#/shared/errors.ts";
import type { TRowPage } from "#/shared/pagination.ts";
import { REPO_TAG } from "#/shared/repo-tags.ts";
import type { TServiceId } from "#/shared/service-id.ts";

export type TPayrollPeriodRow = TBaseRow & {
	name: string;
	month: number;
	year: number;
	startDate: string;
	endDate: string;
	payDate: string;
	status: TPayrollPeriodStatus;
	totalEmployees: number;
	totalGross: number;
	totalPph21: number;
	totalNetPay: number;
};

export type TPayrollItemRow = TBaseRow & {
	payrollPeriodId: string;
	employeeId: string;
	employeeCode: string;
	employeeName: string;
	department: string;
	position: string;
	basicSalary: number;
	allowanceTotal: number;
	overtimeHours: number;
	overtimePay: number;
	bonusTotal: number;
	naturaTotal: number;
	taxAllowance: number;
	grossTotal: number;
	bpjsBreakdown: TBpjsBreakdown;
	taxBreakdown: TTaxBreakdown;
	deductionTotal: number;
	netPay: number;
	calculationLog: string | null;
};

export type TPayrollComponentRow = TBaseRow & {
	payrollPeriodId: string;
	employeeId: string;
	type: TPayrollComponentType;
	amount: number;
	notes: string | null;
};

export type TPayrollBankRow = {
	employeeId: string;
	employeeCode: string;
	employeeName: string;
	bankName: string | null;
	bankAccountNumber: string | null;
	bankAccountHolder: string | null;
	netPay: number;
};

export type TEmployeeTaxYtdRow = TBaseRow & {
	employeeId: string;
	taxYear: number;
	totalGross: number;
	totalPph21Paid: number;
	totalJhtEmployee: number;
	totalJpEmployee: number;
};

export type TPayrollRepo = {
	createPeriod: (
		input: TPayrollPeriodCreateInput,
	) => Effect.Effect<TPayrollPeriodRow, EDatabase>;
	findPeriodById: (
		id: string,
	) => Effect.Effect<TPayrollPeriodRow | null, EDatabase>;
	listPeriods: (
		input: TPayrollPeriodListInput,
	) => Effect.Effect<TRowPage<TPayrollPeriodRow>, EDatabase>;
	updatePeriod: (
		input: TPayrollPeriodUpdateInput,
	) => Effect.Effect<TPayrollPeriodRow | null, EDatabase>;
	calculatePeriod: (
		input: TPayrollCalculateInput,
	) => Effect.Effect<
		{ period: TPayrollPeriodRow; processed: number },
		EDatabase
	>;
	listItems: (
		input: TPayrollItemListInput,
	) => Effect.Effect<TRowPage<TPayrollItemRow>, EDatabase>;
	findItemById: (
		id: string,
	) => Effect.Effect<TPayrollItemRow | null, EDatabase>;
	listAllItems: (
		periodId: string,
	) => Effect.Effect<readonly TPayrollItemRow[], EDatabase>;
	listComponents: (
		periodId: string,
	) => Effect.Effect<readonly TPayrollComponentRow[], EDatabase>;
	listItemComponents: (
		periodId: string,
		employeeId: string,
	) => Effect.Effect<readonly TPayrollComponentRow[], EDatabase>;
	createComponent: (
		data: Omit<TPayrollComponentRow, "id" | "createdAt" | "updatedAt">,
	) => Effect.Effect<TPayrollComponentRow, EDatabase>;
	findComponentById: (
		id: string,
	) => Effect.Effect<TPayrollComponentRow | null, EDatabase>;
	removeComponent: (id: string) => Effect.Effect<boolean, EDatabase>;
	listBankRows: (
		periodId: string,
	) => Effect.Effect<readonly TPayrollBankRow[], EDatabase>;
	findTaxYtd: (
		employeeId: string,
		taxYear: number,
	) => Effect.Effect<TEmployeeTaxYtdRow | null, EDatabase>;
};

export type TPayrollRepoId = TServiceId<typeof REPO_TAG.PAYROLL>;

export const PayrollRepo = Context.Service<TPayrollRepoId, TPayrollRepo>(
	REPO_TAG.PAYROLL,
);
