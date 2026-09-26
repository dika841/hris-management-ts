import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { EMPLOYEE_MESSAGE } from "@app/messages";
import {
	CONTRACT_STATUS,
	CONTRACT_TYPE,
	type TContractConvertInput,
	type TEmployeeContract,
} from "@app/schemas";
import { Effect } from "effect";
import { toContractDto } from "#/employee/application/to-contract-dto.ts";
import { calculatePkwtCompensation } from "#/employee/domain/contract-calculator.ts";
import {
	EmployeeRepo,
	type TEmployeeRepoId,
} from "#/employee/domain/employee.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import { type EDatabase, ENotFound } from "#/shared/errors.ts";

export const contractConvert = Effect.fn("contractConvert")(function* (
	input: TContractConvertInput,
	actorId: string,
): Effect.fn.Return<
	TEmployeeContract,
	ENotFound | EDatabase,
	TEmployeeRepoId | TActivityRecorderId
> {
	const employeeRepo = yield* EmployeeRepo;
	const activityRepo = yield* ActivityRecorder;

	const prev = yield* employeeRepo.findContractById(input.previousContractId);
	if (prev === null) {
		return yield* new ENotFound({ message: EMPLOYEE_MESSAGE.CONTRACT_NOT_FOUND });
	}

	const prevCompensation = calculatePkwtCompensation(
		prev.startDate,
		input.effectiveDate,
		prev.basicSalary + prev.fixedAllowance,
	);

	yield* employeeRepo.updateContract(prev.id, {
		status: CONTRACT_STATUS.CONVERTED,
		endDate: input.effectiveDate,
		compensationAmount: prevCompensation,
	});

	const row = yield* employeeRepo.createContract({
		employeeId: prev.employeeId,
		contractType: CONTRACT_TYPE.PKWTT,
		contractNumber: input.contractNumber,
		startDate: input.effectiveDate,
		endDate: null,
		probationEndDate: null,
		basicSalary: input.basicSalary,
		fixedAllowance: input.fixedAllowance ?? 0,
		position: input.position,
		department: input.department,
		status: CONTRACT_STATUS.ACTIVE,
		compensationAmount: 0,
		compensationPaid: false,
		compensationPaidAt: null,
		documentUrl: null,
		notes: input.notes ?? null,
	});

	yield* employeeRepo.update({
		id: prev.employeeId,
		employmentStatus: "permanent",
		basicSalary: input.basicSalary,
		department: input.department,
		position: input.position,

	});

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.CONTRACT_CONVERT,
		resourceType: ACTIVITY_RESOURCE_TYPE.CONTRACT,
		resourceId: row.id,
		metadata: {
			previousContractId: prev.id,
			contractNumber: input.contractNumber,
			compensationDue: prevCompensation,
		},
	});

	return toContractDto(row);
});
