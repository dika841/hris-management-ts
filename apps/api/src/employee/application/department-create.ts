import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import type { TDepartment, TDepartmentCreateInput } from "@app/schemas";
import { Effect } from "effect";
import { toDepartmentDto } from "#/employee/application/to-org-dto.ts";
import {
	EmployeeRepo,
	type TEmployeeRepoId,
} from "#/employee/domain/employee.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import type { EDatabase } from "#/shared/errors.ts";

export const departmentCreate = Effect.fn("departmentCreate")(function* (
	input: TDepartmentCreateInput,
	actorId: string,
): Effect.fn.Return<
	TDepartment,
	EDatabase,
	TEmployeeRepoId | TActivityRecorderId
> {
	const employeeRepo = yield* EmployeeRepo;
	const activityRepo = yield* ActivityRecorder;

	const row = yield* employeeRepo.createDepartment(input);

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.USER_CREATE,
		resourceType: ACTIVITY_RESOURCE_TYPE.DEPARTMENT,
		resourceId: row.id,
		metadata: { code: row.code, name: row.name },
	});

	return toDepartmentDto(row);
});
