import { type TEmployee, employeeSchema } from "@app/schemas";
import type { TEmployeeRow } from "#/employee/domain/employee.ts";

export const toEmployeeDto = (row: TEmployeeRow): TEmployee =>
	employeeSchema.parse({
		id: row.id,
		userId: row.userId,
		employeeCode: row.employeeCode,
		idCardNumber: row.idCardNumber,
		fullName: row.fullName,
		email: row.email,
		phone: row.phone,
		gender: row.gender,
		dateOfBirth: row.dateOfBirth,
		department: row.department,
		position: row.position,
		employmentStatus: row.employmentStatus,
		joinDate: row.joinDate,
		endDate: row.endDate,
		basicSalary: row.basicSalary,
		taxMethod: row.taxMethod,
		ptkpCode: row.ptkpCode,
		npwp: row.npwp,
		bankName: row.bankName,
		bankAccountNumber: row.bankAccountNumber,
		bankAccountHolder: row.bankAccountHolder,
		bpjsKesehatanNumber: row.bpjsKesehatanNumber,
		bpjsKetenagakerjaanNumber: row.bpjsKetenagakerjaanNumber,
		jkkRiskGrade: row.jkkRiskGrade,
		pdpConsentGiven: row.pdpConsentGiven,
		pdpConsentDate: row.pdpConsentDate
			? row.pdpConsentDate.toISOString()
			: null,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	});
