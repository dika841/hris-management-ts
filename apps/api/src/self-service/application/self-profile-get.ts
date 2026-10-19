import type { TSelfProfile } from "@app/schemas";
import { Effect } from "effect";
import {
	EmployeeRepo,
	type TEmployeeRepoId,
	toEmployeeDto,
} from "#/employee/index.ts";
import type { EDatabase } from "#/shared/errors.ts";

export const selfProfileGet = Effect.fn("selfProfileGet")(function* (
	userId: string,
): Effect.fn.Return<TSelfProfile, EDatabase, TEmployeeRepoId> {
	const employeeRepo = yield* EmployeeRepo;
	const employee = yield* employeeRepo.findByUserId(userId);
	if (employee === null) {
		return { linked: false } as const;
	}
	return { linked: true, employee: toEmployeeDto(employee) } as const;
});
