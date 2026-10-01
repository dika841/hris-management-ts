import type { TDepartment } from "@app/schemas";
import { Effect } from "effect";
import { toDepartmentDto } from "#/employee/application/to-org-dto.ts";
import {
	EmployeeRepo,
	type TEmployeeRepoId,
} from "#/employee/domain/employee.ts";
import type { EDatabase } from "#/shared/errors.ts";

export const departmentList = Effect.fn("departmentList")(
	function* (): Effect.fn.Return<TDepartment[], EDatabase, TEmployeeRepoId> {
		const employeeRepo = yield* EmployeeRepo;
		const rows = yield* employeeRepo.listDepartments();
		return rows.map(toDepartmentDto);
	},
);
