import { type TEmployeeContract, employeeContractSchema } from "@app/schemas";
import type { TEmployeeContractRow } from "#/employee/domain/employee.ts";

export const toContractDto = (row: TEmployeeContractRow): TEmployeeContract =>
	employeeContractSchema.parse({
		id: row.id,
		employeeId: row.employeeId,
		contractType: row.contractType,
		contractNumber: row.contractNumber,
		startDate: row.startDate,
		endDate: row.endDate,
		probationEndDate: row.probationEndDate,
		basicSalary: row.basicSalary,
		fixedAllowance: row.fixedAllowance,
		position: row.position,
		department: row.department,
		status: row.status,
		compensationAmount: row.compensationAmount,
		compensationPaid: row.compensationPaid,
		compensationPaidAt: row.compensationPaidAt
			? row.compensationPaidAt.toISOString()
			: null,
		documentUrl: row.documentUrl,
		notes: row.notes,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	});
