import type { TEmployeeContract } from "@app/schemas";
import { Effect } from "effect";
import { toContractDto } from "#/employee/application/to-contract-dto.ts";
import {
	EmployeeRepo,
	type TEmployeeRepoId,
} from "#/employee/domain/employee.ts";
import type { EDatabase } from "#/shared/errors.ts";

export const contractList = Effect.fn("contractList")(function* (
	employeeId: string,
): Effect.fn.Return<
	TEmployeeContract[],
	EDatabase,
	TEmployeeRepoId
> {
	const employeeRepo = yield* EmployeeRepo;
	const rows = yield* employeeRepo.listContracts(employeeId);
	return rows.map(toContractDto);
});
