import type { TTaxSimulationInput, TTaxSimulationResult } from "@app/schemas";
import { Effect } from "effect";
import { calculateOvertime } from "#/payroll/domain/overtime-calculator.ts";
import { calculatePayroll } from "#/payroll/domain/payroll-calculator.ts";

export const payrollTaxSimulate = Effect.fn("payrollTaxSimulate")(function* (
	input: TTaxSimulationInput,
): Effect.fn.Return<TTaxSimulationResult, never, never> {
	// Hitung lembur bila ada jam lembur
	const overtimeResult = calculateOvertime({
		basicSalary: input.basicSalary,
		fixedAllowances: input.allowances,
		weekdayOvertimeHours: input.overtimeHours,
	});

	const result = calculatePayroll({
		basicSalary: input.basicSalary,
		ptkpCode: input.ptkpCode,
		taxMethod: input.taxMethod,
		allowances: input.allowances,
		overtimePay: overtimeResult.totalOvertimePay,
		bonus: input.bonus,
		natura: input.natura,
		jkkRiskGrade: input.jkkRiskGrade,
		month: input.month,
		ytdContext:
			input.month === 12
				? {
						ytdGrossJanToNov: input.ytdGrossJanToNov,
						ytdPph21JanToNov: input.ytdPph21JanToNov,
					}
				: undefined,
	});

	return {
		basicSalary: result.basicSalary,
		allowances: result.allowances,
		overtimePay: result.overtimePay,
		bonus: result.bonus,
		natura: result.natura,
		taxAllowance: result.taxAllowance,
		grossTotal: result.cashGross,
		bpjs: result.bpjs,
		tax: result.tax,
		employeeDeductions: result.totalEmployeeDeductions,
		takeHomePay: result.netPay,
		explanation: result.explanation,
	};
});
