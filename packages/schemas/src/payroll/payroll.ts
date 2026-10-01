import { z } from "zod";
import {
	employeeIdSchema,
	ptkpCodeSchema,
	taxMethodSchema,
} from "../employee/employee.ts";
import { baseSchema, type TEntityOf } from "../shared/base-schema.ts";
import { paginated, paginationSchema } from "../shared/pagination.ts";
import { SORT_DIRECTION, sortDirectionSchema } from "../shared/sort.ts";

export const payrollPeriodIdSchema = z.string().min(1);
export const payrollItemIdSchema = z.string().min(1);
export const payrollComponentIdSchema = z.string().min(1);

export const PAYROLL_PERIOD_STATUS = {
	DRAFT: "draft",
	CALCULATING: "calculating",
	APPROVED: "approved",
	PAID: "paid",
	LOCKED: "locked",
} as const;
export type TPayrollPeriodStatus =
	(typeof PAYROLL_PERIOD_STATUS)[keyof typeof PAYROLL_PERIOD_STATUS];

export const payrollPeriodStatusSchema = z.enum([
	PAYROLL_PERIOD_STATUS.DRAFT,
	PAYROLL_PERIOD_STATUS.CALCULATING,
	PAYROLL_PERIOD_STATUS.APPROVED,
	PAYROLL_PERIOD_STATUS.PAID,
	PAYROLL_PERIOD_STATUS.LOCKED,
]);

export const payrollPeriodSchema = baseSchema(payrollPeriodIdSchema).extend({
	name: z.string(), // Contoh: "September 2026"
	month: z.number().int().min(1).max(12),
	year: z.number().int().min(2020).max(2100),
	startDate: z.string(), // YYYY-MM-DD
	endDate: z.string(), // YYYY-MM-DD
	payDate: z.string(), // YYYY-MM-DD
	status: payrollPeriodStatusSchema,
	totalEmployees: z.number().int().nonnegative().default(0),
	totalGross: z.number().int().nonnegative().default(0),
	totalPph21: z.number().int().nonnegative().default(0),
	totalNetPay: z.number().int().nonnegative().default(0),
});
export type TPayrollPeriod = TEntityOf<z.infer<typeof payrollPeriodSchema>>;

export const payrollPeriodCreateInputSchema = z.object({
	name: z.string().min(1).max(100),
	month: z.number().int().min(1).max(12),
	year: z.number().int().min(2020).max(2100),
	startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	payDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
export type TPayrollPeriodCreateInput = z.infer<
	typeof payrollPeriodCreateInputSchema
>;

export const payrollPeriodUpdateInputSchema = payrollPeriodCreateInputSchema
	.partial()
	.extend({
		id: payrollPeriodIdSchema,
		status: payrollPeriodStatusSchema.optional(),
	});
export type TPayrollPeriodUpdateInput = z.infer<
	typeof payrollPeriodUpdateInputSchema
>;

// Rincian Komponen BPJS
export const bpjsBreakdownSchema = z.object({
	// BPJS Kesehatan
	kesehatanCompany: z.number().int().nonnegative(), // 4%
	kesehatanEmployee: z.number().int().nonnegative(), // 1%
	// BPJS Ketenagakerjaan
	jhtCompany: z.number().int().nonnegative(), // 3.7%
	jhtEmployee: z.number().int().nonnegative(), // 2.0%
	jkkCompany: z.number().int().nonnegative(), // 0.24% - 1.74%
	jkmCompany: z.number().int().nonnegative(), // 0.30%
	jpCompany: z.number().int().nonnegative(), // 2.0%
	jpEmployee: z.number().int().nonnegative(), // 1.0%
	// Agregat
	totalCompanyBpjs: z.number().int().nonnegative(),
	totalEmployeeBpjs: z.number().int().nonnegative(),
});
export type TBpjsBreakdown = z.infer<typeof bpjsBreakdownSchema>;

// Rincian Perhitungan Pajak PPh 21
export const taxBreakdownSchema = z.object({
	taxMethod: taxMethodSchema,
	ptkpCode: ptkpCodeSchema,
	terCategory: z.enum(["TER_A", "TER_B", "TER_C", "PASAL_17"]),
	terRate: z.number().min(0).max(1), // misal 0.05 untuk 5%
	isDecemberReconciliation: z.boolean(),
	// Bruto Pajak
	taxableGrossMonthly: z.number().int().nonnegative(),
	// Untuk Gross-Up
	taxAllowance: z.number().int().nonnegative(),
	// PPh 21 Terhitung
	pph21Monthly: z.number().int().nonnegative(),
	// Data Tahunan (bila rekonsiliasi Desember)
	annualizedGross: z.number().int().nonnegative().optional(),
	occupationalCost: z.number().int().nonnegative().optional(), // Biaya jabatan maks 6jt/thn
	annualPensionContributions: z.number().int().nonnegative().optional(), // JHT + JP employee
	annualPtkpValue: z.number().int().nonnegative().optional(),
	taxableIncomeAnnual: z.number().int().nonnegative().optional(), // PKP setahun
	annualPph21Calculated: z.number().int().nonnegative().optional(),
	ytdPph21PaidJanToNov: z.number().int().nonnegative().optional(),
});
export type TTaxBreakdown = z.infer<typeof taxBreakdownSchema>;

// Payroll Item (Slip Gaji per Karyawan)
export const payrollItemSchema = baseSchema(payrollItemIdSchema).extend({
	payrollPeriodId: payrollPeriodIdSchema,
	employeeId: employeeIdSchema,
	employeeCode: z.string(),
	employeeName: z.string(),
	department: z.string(),
	position: z.string(),
	// Komponen Penghasilan
	basicSalary: z.number().int().nonnegative(),
	allowanceTotal: z.number().int().nonnegative(),
	overtimeHours: z.number().min(0),
	overtimePay: z.number().int().nonnegative(),
	bonusTotal: z.number().int().nonnegative(),
	naturaTotal: z.number().int().nonnegative(), // Natura PMK 66/2023
	// Tunjangan Pajak (Gross Up)
	taxAllowance: z.number().int().nonnegative(),
	// Total Bruto
	grossTotal: z.number().int().nonnegative(),
	// BPJS Breakdown
	bpjs: bpjsBreakdownSchema,
	// Pajak PPh 21
	tax: taxBreakdownSchema,
	// Potongan
	deductionTotal: z.number().int().nonnegative(),
	// Gaji Bersih (Take Home Pay)
	netPay: z.number().int().nonnegative(),
	// Catatan audit / XAI explanation
	calculationLog: z.string().optional(),
});
export type TPayrollItem = TEntityOf<z.infer<typeof payrollItemSchema>>;

export const payrollCalculateInputSchema = z.object({
	periodId: payrollPeriodIdSchema,
	employeeIds: z.array(employeeIdSchema).optional(),
});
export type TPayrollCalculateInput = z.infer<
	typeof payrollCalculateInputSchema
>;

// Simulasi Cepat Kalkulator Pajak PPh 21 TER
export const taxSimulationInputSchema = z.object({
	basicSalary: z.number().int().nonnegative(),
	ptkpCode: ptkpCodeSchema.default("TK/0"),
	taxMethod: taxMethodSchema.default("gross"),
	allowances: z.number().int().nonnegative().default(0),
	overtimeHours: z.number().min(0).default(0),
	bonus: z.number().int().nonnegative().default(0),
	natura: z.number().int().nonnegative().default(0),
	jkkRiskGrade: z.number().min(1).max(5).default(1),
	month: z.number().int().min(1).max(12).default(1),
	ytdGrossJanToNov: z.number().int().nonnegative().default(0),
	ytdPph21JanToNov: z.number().int().nonnegative().default(0),
});
export type TTaxSimulationInput = z.infer<typeof taxSimulationInputSchema>;

export const taxSimulationResultSchema = z.object({
	basicSalary: z.number().int().nonnegative(),
	allowances: z.number().int().nonnegative(),
	overtimePay: z.number().int().nonnegative(),
	bonus: z.number().int().nonnegative(),
	natura: z.number().int().nonnegative(),
	taxAllowance: z.number().int().nonnegative(),
	grossTotal: z.number().int().nonnegative(),
	bpjs: bpjsBreakdownSchema,
	tax: taxBreakdownSchema,
	employeeDeductions: z.number().int().nonnegative(),
	takeHomePay: z.number().int().nonnegative(),
	explanation: z.string(),
});
export type TTaxSimulationResult = z.infer<typeof taxSimulationResultSchema>;

export const PAYROLL_SORT = {
	NAME: "name",
	YEAR: "year",
	MONTH: "month",
	STATUS: "status",
	PAY_DATE: "payDate",
	CREATED_AT: "createdAt",
} as const;
export type TPayrollSort = (typeof PAYROLL_SORT)[keyof typeof PAYROLL_SORT];

export const payrollPeriodListInputSchema = paginationSchema.extend({
	year: z.number().int().optional(),
	status: payrollPeriodStatusSchema.optional(),
	sortBy: z
		.enum([
			PAYROLL_SORT.NAME,
			PAYROLL_SORT.YEAR,
			PAYROLL_SORT.MONTH,
			PAYROLL_SORT.STATUS,
			PAYROLL_SORT.PAY_DATE,
			PAYROLL_SORT.CREATED_AT,
		])
		.default(PAYROLL_SORT.CREATED_AT),
	sortDir: sortDirectionSchema.default(SORT_DIRECTION.DESC),
});
export type TPayrollPeriodListInput = z.infer<
	typeof payrollPeriodListInputSchema
>;

export const payrollPeriodListSchema = paginated(payrollPeriodSchema);
export type TPayrollPeriodList = z.infer<typeof payrollPeriodListSchema>;

export const payrollItemListInputSchema = paginationSchema.extend({
	periodId: payrollPeriodIdSchema,
	department: z.string().optional(),
	search: z.string().optional(),
});
export type TPayrollItemListInput = z.infer<typeof payrollItemListInputSchema>;

export const payrollItemListSchema = paginated(payrollItemSchema);
export type TPayrollItemList = z.infer<typeof payrollItemListSchema>;
