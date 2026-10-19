import type { TEmployeeCareerHistory } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { Effect } from "effect";
import { toCareerHistoryDto } from "#/employee/application/to-career-dto.ts";
import {
	EmployeeRepo,
	type TEmployeeRepoId,
} from "#/employee/domain/employee.ts";
import type { EDatabase } from "#/shared/errors.ts";

export const careerHistoryList = Effect.fn("careerHistoryList")(function* (
	employeeId: string,
): Effect.fn.Return<TEmployeeCareerHistory[], EDatabase, TEmployeeRepoId> {
	const employeeRepo = yield* EmployeeRepo;
	const rows = yield* employeeRepo.listCareerHistory(employeeId);
	return [...A.map(rows, toCareerHistoryDto)];
});
