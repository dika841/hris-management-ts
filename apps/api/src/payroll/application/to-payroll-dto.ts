import {
	type TPayrollItem,
	type TPayrollPeriod,
	payrollItemSchema,
	payrollPeriodSchema,
} from "@app/schemas";
import type {
	TPayrollItemRow,
	TPayrollPeriodRow,
} from "#/payroll/domain/payroll.ts";

export const toPayrollPeriodDto = (row: TPayrollPeriodRow): TPayrollPeriod =>
	payrollPeriodSchema.parse({
		id: row.id,
		name: row.name,
		month: row.month,
		year: row.year,
		startDate: row.startDate,
		endDate: row.endDate,
		payDate: row.payDate,
		status: row.status,
		totalEmployees: row.totalEmployees,
		totalGross: row.totalGross,
		totalPph21: row.totalPph21,
		totalNetPay: row.totalNetPay,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	});

export const toPayrollItemDto = (row: TPayrollItemRow): TPayrollItem =>
	payrollItemSchema.parse({
		id: row.id,
		payrollPeriodId: row.payrollPeriodId,
		employeeId: row.employeeId,
		employeeCode: row.employeeCode,
		employeeName: row.employeeName,
		department: row.department,
		position: row.position,
		basicSalary: row.basicSalary,
		allowanceTotal: row.allowanceTotal,
		overtimeHours: row.overtimeHours,
		overtimePay: row.overtimePay,
		bonusTotal: row.bonusTotal,
		naturaTotal: row.naturaTotal,
		taxAllowance: row.taxAllowance,
		grossTotal: row.grossTotal,
		bpjs: row.bpjsBreakdown,
		tax: row.taxBreakdown,
		deductionTotal: row.deductionTotal,
		netPay: row.netPay,
		calculationLog: row.calculationLog ?? undefined,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	});
