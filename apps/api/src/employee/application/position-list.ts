import type { TPosition } from "@app/schemas";
import { Effect } from "effect";
import { toPositionDto } from "#/employee/application/to-org-dto.ts";
import {
	EmployeeRepo,
	type TEmployeeRepoId,
} from "#/employee/domain/employee.ts";
import type { EDatabase } from "#/shared/errors.ts";

export const positionList = Effect.fn("positionList")(
	function* (): Effect.fn.Return<TPosition[], EDatabase, TEmployeeRepoId> {
		const employeeRepo = yield* EmployeeRepo;
		const rows = yield* employeeRepo.listPositions();
		return rows.map(toPositionDto);
	},
);
