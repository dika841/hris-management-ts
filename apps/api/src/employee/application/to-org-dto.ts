import {
	type TDepartment,
	type TPosition,
	departmentSchema,
	positionSchema,
} from "@app/schemas";
import type {
	TDepartmentRow,
	TPositionRow,
} from "#/employee/domain/employee.ts";

export const toDepartmentDto = (row: TDepartmentRow): TDepartment =>
	departmentSchema.parse({
		id: row.id,
		code: row.code,
		name: row.name,
		description: row.description,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	});

export const toPositionDto = (row: TPositionRow): TPosition =>
	positionSchema.parse({
		id: row.id,
		departmentId: row.departmentId,
		code: row.code,
		title: row.title,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	});
