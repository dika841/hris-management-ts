import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { EMPLOYEE_MESSAGE } from "@app/messages";
import {
	CONTRACT_STATUS,
	CONTRACT_TYPE,
	type TContractRenewInput,
	type TEmployeeContract,
} from "@app/schemas";
import { Effect } from "effect";
import { toContractDto } from "#/employee/application/to-contract-dto.ts";
import {
	calculatePkwtCompensation,
	calculateTenureMonths,
	isPkwtOverMaxDuration,
} from "#/employee/domain/contract-calculator.ts";
import {
	EmployeeRepo,
	type TEmployeeRepoId,
} from "#/employee/domain/employee.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import { EConflict, type EDatabase, ENotFound } from "#/shared/errors.ts";

export const contractRenew = Effect.fn("contractRenew")(function* (
	input: TContractRenewInput,
	actorId: string,
): Effect.fn.Return<
	TEmployeeContract,
	ENotFound | EConflict | EDatabase,
	TEmployeeRepoId | TActivityRecorderId
> {
	const employeeRepo = yield* EmployeeRepo;
	const activityRepo = yield* ActivityRecorder;

	const prev = yield* employeeRepo.findContractById(input.previousContractId);
	if (prev === null) {
		return yield* new ENotFound({
			message: EMPLOYEE_MESSAGE.CONTRACT_NOT_FOUND,
		});
	}

	const prevCompensation = prev.endDate
		? calculatePkwtCompensation(
				prev.startDate,
				prev.endDate,
				prev.basicSalary + prev.fixedAllowance,
			)
		: 0;

	yield* employeeRepo.updateContract(prev.id, {
		status: CONTRACT_STATUS.RENEWED,
		compensationAmount: prevCompensation,
	});

	const existingContracts = yield* employeeRepo.listContracts(prev.employeeId);
	let cumulativeMonths = 0;
	for (const c of existingContracts) {
		if (c.contractType === CONTRACT_TYPE.PKWT && c.endDate) {
			cumulativeMonths += calculateTenureMonths(c.startDate, c.endDate);
		}
	}

	const newDurationMonths = calculateTenureMonths(
		input.startDate,
		input.endDate,
	);
	if (isPkwtOverMaxDuration(cumulativeMonths + newDurationMonths)) {
		return yield* new EConflict({
			message: EMPLOYEE_MESSAGE.PKWT_MAX_DURATION_EXCEEDED,
		});
	}

	const newCompensationEstimate = calculatePkwtCompensation(
		input.startDate,
		input.endDate,
		input.basicSalary + (input.fixedAllowance ?? 0),
	);

	const row = yield* employeeRepo.createContract({
		employeeId: prev.employeeId,
		contractType: CONTRACT_TYPE.PKWT,
		contractNumber: input.contractNumber,
		startDate: input.startDate,
		endDate: input.endDate,
		probationEndDate: null,
		basicSalary: input.basicSalary,
		fixedAllowance: input.fixedAllowance ?? 0,
		position: input.position,
		department: input.department,
		status: CONTRACT_STATUS.ACTIVE,
		compensationAmount: newCompensationEstimate,
		compensationPaid: false,
		compensationPaidAt: null,
		documentUrl: null,
		notes: input.notes ?? null,
	});

	yield* employeeRepo.update({
		id: prev.employeeId,
		basicSalary: input.basicSalary,
		department: input.department,
		position: input.position,
		endDate: input.endDate,
	});

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.CONTRACT_RENEW,
		resourceType: ACTIVITY_RESOURCE_TYPE.CONTRACT,
		resourceId: row.id,
		metadata: {
			previousContractId: prev.id,
			newContractNumber: input.contractNumber,
			previousCompensationDue: prevCompensation,
		},
	});

	return toContractDto(row);
});
