import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { EMPLOYEE_MESSAGE } from "@app/messages";
import type {
	TContractPayCompensationInput,
	TEmployeeContract,
} from "@app/schemas";
import { Effect } from "effect";
import { toContractDto } from "#/employee/application/to-contract-dto.ts";
import {
	EmployeeRepo,
	type TEmployeeRepoId,
} from "#/employee/domain/employee.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import { type EDatabase, ENotFound } from "#/shared/errors.ts";

export const contractCompensationPay = Effect.fn("contractCompensationPay")(
	function* (
		input: TContractPayCompensationInput,
		actorId: string,
	): Effect.fn.Return<
		TEmployeeContract,
		ENotFound | EDatabase,
		TEmployeeRepoId | TActivityRecorderId
	> {
		const employeeRepo = yield* EmployeeRepo;
		const activityRepo = yield* ActivityRecorder;

		const contract = yield* employeeRepo.findContractById(input.contractId);
		if (contract === null) {
			return yield* new ENotFound({
				message: EMPLOYEE_MESSAGE.CONTRACT_NOT_FOUND,
			});
		}

		const updatedNotes = [contract.notes, input.notes]
			.filter(Boolean)
			.join(" | ");

		const updated = yield* employeeRepo.updateContract(input.contractId, {
			compensationPaid: true,
			compensationPaidAt: new Date(),
			notes: updatedNotes || null,
		});

		if (updated === null) {
			return yield* new ENotFound({
				message: EMPLOYEE_MESSAGE.CONTRACT_NOT_FOUND,
			});
		}

		yield* activityRepo.insert({
			actorId,
			action: ACTIVITY_ACTION.CONTRACT_COMPENSATION_PAY,
			resourceType: ACTIVITY_RESOURCE_TYPE.CONTRACT,
			resourceId: updated.id,
			metadata: {
				amount: updated.compensationAmount,
				contractNumber: updated.contractNumber,
			},
		});

		return toContractDto(updated);
	},
);
