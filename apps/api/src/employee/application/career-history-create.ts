import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { EMPLOYEE_MESSAGE } from "@app/messages";
import type {
	TCareerHistoryCreateInput,
	TEmployeeCareerHistory,
} from "@app/schemas";
import { Effect } from "effect";
import { toCareerHistoryDto } from "#/employee/application/to-career-dto.ts";
import {
	EmployeeRepo,
	type TEmployeeRepoId,
} from "#/employee/domain/employee.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import { type EDatabase, ENotFound } from "#/shared/errors.ts";

export const careerHistoryCreate = Effect.fn("careerHistoryCreate")(function* (
	input: TCareerHistoryCreateInput,
	actorId: string,
): Effect.fn.Return<
	TEmployeeCareerHistory,
	ENotFound | EDatabase,
	TEmployeeRepoId | TActivityRecorderId
> {
	const employeeRepo = yield* EmployeeRepo;
	const activityRepo = yield* ActivityRecorder;

	const employee = yield* employeeRepo.findById(input.employeeId);
	if (employee === null) {
		return yield* new ENotFound({ message: EMPLOYEE_MESSAGE.NOT_FOUND });
	}

	const row = yield* employeeRepo.createCareerHistory({
		employeeId: employee.id,
		changeType: input.changeType,
		effectiveDate: input.effectiveDate,
		previousDepartment: employee.department,
		newDepartment: input.newDepartment,
		previousPosition: employee.position,
		newPosition: input.newPosition,
		previousSalary: employee.basicSalary,
		newSalary: input.newSalary,
		notes: input.notes ?? null,
	});

	const updated = yield* employeeRepo.update({
		id: employee.id,
		department: input.newDepartment,
		position: input.newPosition,
		basicSalary: input.newSalary,
	});
	if (updated === null) {
		return yield* new ENotFound({ message: EMPLOYEE_MESSAGE.NOT_FOUND });
	}

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.EMPLOYEE_CAREER_CHANGE,
		resourceType: ACTIVITY_RESOURCE_TYPE.EMPLOYEE,
		resourceId: employee.id,
		metadata: {
			changeType: input.changeType,
			effectiveDate: input.effectiveDate,
			previousDepartment: employee.department,
			newDepartment: input.newDepartment,
			previousPosition: employee.position,
			newPosition: input.newPosition,
			previousSalary: employee.basicSalary,
			newSalary: input.newSalary,
		},
	});

	return toCareerHistoryDto(row);
});
