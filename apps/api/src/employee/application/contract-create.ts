import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { EMPLOYEE_MESSAGE } from "@app/messages";
import {
	CONTRACT_STATUS,
	CONTRACT_TYPE,
	type TContractCreateInput,
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

export const contractCreate = Effect.fn("contractCreate")(function* (
	input: TContractCreateInput,
	actorId: string,
): Effect.fn.Return<
	TEmployeeContract,
	ENotFound | EConflict | EDatabase,
	TEmployeeRepoId | TActivityRecorderId
> {
	const employeeRepo = yield* EmployeeRepo;
	const activityRepo = yield* ActivityRecorder;

	const targetEmployee = yield* employeeRepo.findById(input.employeeId);
	if (targetEmployee === null) {
		return yield* new ENotFound({ message: EMPLOYEE_MESSAGE.NOT_FOUND });
	}

	let compensationAmount = 0;

	if (input.contractType === CONTRACT_TYPE.PKWT) {
		if (input.probationEndDate) {
			return yield* new EConflict({
				message: EMPLOYEE_MESSAGE.PKWT_PROBATION_FORBIDDEN,
			});
		}

		if (!input.endDate) {
			return yield* new EConflict({
				message: "PKWT contract must have an end date.",
			});
		}

		const existingContracts = yield* employeeRepo.listContracts(input.employeeId);
		let cumulativeMonths = 0;
		for (const c of existingContracts) {
			if (c.contractType === CONTRACT_TYPE.PKWT && c.endDate) {
				cumulativeMonths += calculateTenureMonths(c.startDate, c.endDate);
			}
		}

		const newDurationMonths = calculateTenureMonths(input.startDate, input.endDate);
		if (isPkwtOverMaxDuration(cumulativeMonths + newDurationMonths)) {
			return yield* new EConflict({
				message: EMPLOYEE_MESSAGE.PKWT_MAX_DURATION_EXCEEDED,
			});
		}

		compensationAmount = calculatePkwtCompensation(
			input.startDate,
			input.endDate,
			input.basicSalary + (input.fixedAllowance ?? 0),
		);
	}

	const row = yield* employeeRepo.createContract({
		employeeId: input.employeeId,
		contractType: input.contractType,
		contractNumber: input.contractNumber,
		startDate: input.startDate,
		endDate: input.endDate ?? null,
		probationEndDate: input.probationEndDate ?? null,
		basicSalary: input.basicSalary,
		fixedAllowance: input.fixedAllowance ?? 0,
		position: input.position,
		department: input.department,
		status: CONTRACT_STATUS.ACTIVE,
		compensationAmount,
		compensationPaid: false,
		compensationPaidAt: null,
		documentUrl: input.documentUrl ?? null,
		notes: input.notes ?? null,
	});

	const statusMap = {
		[CONTRACT_TYPE.PKWT]: "contract" as const,
		[CONTRACT_TYPE.PKWTT]: "permanent" as const,
		[CONTRACT_TYPE.INTERNSHIP]: "intern" as const,
		[CONTRACT_TYPE.FREELANCE]: "contract" as const,
	};

	yield* employeeRepo.update({
		id: input.employeeId,
		employmentStatus: statusMap[input.contractType],
		basicSalary: input.basicSalary,
		department: input.department,
		position: input.position,
		...(input.endDate ? { endDate: input.endDate } : {}),
	});

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.CONTRACT_CREATE,
		resourceType: ACTIVITY_RESOURCE_TYPE.CONTRACT,
		resourceId: row.id,
		metadata: {
			employeeId: input.employeeId,
			contractNumber: input.contractNumber,
			contractType: input.contractType,
		},
	});

	return toContractDto(row);
});
