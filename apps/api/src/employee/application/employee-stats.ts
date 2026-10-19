import type { TEmployeeStats } from "@app/schemas";
import { Effect } from "effect";
import {
	EmployeeRepo,
	type TEmployeeRepoId,
} from "#/employee/domain/employee.ts";
import type { EDatabase } from "#/shared/errors.ts";

export const employeeStats = Effect.fn("employeeStats")(
	function* (): Effect.fn.Return<TEmployeeStats, EDatabase, TEmployeeRepoId> {
		const employeeRepo = yield* EmployeeRepo;
		return yield* employeeRepo.stats();
	},
);
