import { type TEmployee, employeeSchema } from "@app/schemas";
import type { TEmployeeRow } from "#/employee/domain/employee.ts";

const MASKED_VALUE = "••••••••";

const maskValue = (value: string | null): string | null =>
	value === null ? null : MASKED_VALUE;

export const toEmployeeDto = (
	row: TEmployeeRow,
	maskSensitive = false,
): TEmployee =>
	employeeSchema.parse({
		id: row.id,
		userId: row.userId,
		employeeCode: row.employeeCode,
		idCardNumber: maskSensitive ? MASKED_VALUE : row.idCardNumber,
		fullName: row.fullName,
		email: row.email,
		phone: maskSensitive ? maskValue(row.phone) : row.phone,
		gender: row.gender,
		dateOfBirth: row.dateOfBirth,
		departmentId: row.departmentId,
		department: row.department,
		positionId: row.positionId,
		position: row.position,
		employmentStatus: row.employmentStatus,
		workScheduleType: row.workScheduleType,
		workStartTime: row.workStartTime,
		workEndTime: row.workEndTime,
		joinDate: row.joinDate,
		endDate: row.endDate,
		managerId: row.managerId,
		basicSalary: row.basicSalary,
		taxMethod: row.taxMethod,
		ptkpCode: row.ptkpCode,
		npwp: maskSensitive ? maskValue(row.npwp) : row.npwp,
		bankName: row.bankName,
		bankAccountNumber: maskSensitive
			? maskValue(row.bankAccountNumber)
			: row.bankAccountNumber,
		bankAccountHolder: maskSensitive
			? maskValue(row.bankAccountHolder)
			: row.bankAccountHolder,
		bpjsKesehatanNumber: maskSensitive
			? maskValue(row.bpjsKesehatanNumber)
			: row.bpjsKesehatanNumber,
		bpjsKetenagakerjaanNumber: maskSensitive
			? maskValue(row.bpjsKetenagakerjaanNumber)
			: row.bpjsKetenagakerjaanNumber,
		jkkRiskGrade: row.jkkRiskGrade,
		pdpConsentGiven: row.pdpConsentGiven,
		pdpConsentDate: row.pdpConsentDate
			? row.pdpConsentDate.toISOString()
			: null,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	});
