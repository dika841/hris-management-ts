import type { TEmployeeContract } from "@app/schemas";
import { Effect } from "effect";
import { toContractDto } from "#/employee/application/to-contract-dto.ts";
import {
	EmployeeRepo,
	type TEmployeeRepoId,
} from "#/employee/domain/employee.ts";
import type { EDatabase } from "#/shared/errors.ts";

export const expiringContractsGet = Effect.fn("expiringContractsGet")(function* (
	days = 30,
): Effect.fn.Return<
	TEmployeeContract[],
	EDatabase,
	TEmployeeRepoId
> {
	const employeeRepo = yield* EmployeeRepo;
	const rows = yield* employeeRepo.listExpiringContracts(days);
	return rows.map(toContractDto);
});
