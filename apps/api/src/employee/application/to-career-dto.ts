import {
	employeeCareerHistorySchema,
	type TEmployeeCareerHistory,
} from "@app/schemas";
import type { TEmployeeCareerRow } from "#/employee/domain/employee.ts";

export const toCareerHistoryDto = (
	row: TEmployeeCareerRow,
): TEmployeeCareerHistory =>
	employeeCareerHistorySchema.parse({
		id: row.id,
		employeeId: row.employeeId,
		changeType: row.changeType,
		effectiveDate: row.effectiveDate,
		previousDepartment: row.previousDepartment,
		newDepartment: row.newDepartment,
		previousPosition: row.previousPosition,
		newPosition: row.newPosition,
		previousSalary: row.previousSalary,
		newSalary: row.newSalary,
		notes: row.notes,
		createdAt: row.createdAt.toISOString(),
	});
