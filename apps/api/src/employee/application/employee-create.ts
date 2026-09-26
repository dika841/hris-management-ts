import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { EMPLOYEE_MESSAGE } from "@app/messages";
import type { TEmployee, TEmployeeCreateInput } from "@app/schemas";
import { Effect } from "effect";
import { toEmployeeDto } from "#/employee/application/to-employee-dto.ts";
import {
	EmployeeRepo,
	type TEmployeeRepoId,
} from "#/employee/domain/employee.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import { EConflict, type EDatabase } from "#/shared/errors.ts";

export const employeeCreate = Effect.fn("employeeCreate")(function* (
	input: TEmployeeCreateInput,
	actorId: string,
): Effect.fn.Return<
	TEmployee,
	EConflict | EDatabase,
	TEmployeeRepoId | TActivityRecorderId
> {
	const employeeRepo = yield* EmployeeRepo;
	const activityRepo = yield* ActivityRecorder;

	const existingCode = yield* employeeRepo.findByCode(input.employeeCode);
	if (existingCode !== null) {
		return yield* new EConflict({ message: EMPLOYEE_MESSAGE.CODE_TAKEN });
	}

	const existingEmail = yield* employeeRepo.findByEmail(input.email);
	if (existingEmail !== null) {
		return yield* new EConflict({ message: EMPLOYEE_MESSAGE.EMAIL_TAKEN });
	}

	const row = yield* employeeRepo.create(input);

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.EMPLOYEE_CREATE,
		resourceType: ACTIVITY_RESOURCE_TYPE.EMPLOYEE,
		resourceId: row.id,
		metadata: {
			employeeCode: row.employeeCode,
			department: row.department,
		},
	});

	return toEmployeeDto(row);
});
