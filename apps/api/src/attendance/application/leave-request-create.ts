import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { ATTENDANCE_MESSAGE, EMPLOYEE_MESSAGE } from "@app/messages";
import {
	LEAVE_CODE,
	LEAVE_REQUEST_STATUS,
	type TLeaveRequest,
	type TLeaveRequestCreateInput,
} from "@app/schemas";
import { Effect } from "effect";
import { toLeaveRequestDto } from "#/attendance/application/to-leave-dto.ts";
import {
	AttendanceRepo,
	type TAttendanceRepoId,
} from "#/attendance/domain/attendance.ts";
import {
	calculateWorkingDays,
	isAnnualLeaveEligible,
} from "#/attendance/domain/overtime-calculator.ts";
import { EmployeeRepo, type TEmployeeRepoId } from "#/employee/index.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import {
	EBadRequest,
	EConflict,
	type EDatabase,
	ENotFound,
} from "#/shared/errors.ts";

export const leaveRequestCreate = Effect.fn("leaveRequestCreate")(function* (
	input: TLeaveRequestCreateInput,
	actorId: string,
): Effect.fn.Return<
	TLeaveRequest,
	ENotFound | EConflict | EBadRequest | EDatabase,
	TAttendanceRepoId | TEmployeeRepoId | TActivityRecorderId
> {
	const attendanceRepo = yield* AttendanceRepo;
	const employeeRepo = yield* EmployeeRepo;
	const activityRepo = yield* ActivityRecorder;

	// 1. Validate employee exists
	const employee = yield* employeeRepo.findById(input.employeeId);
	if (employee === null) {
		return yield* new ENotFound({ message: EMPLOYEE_MESSAGE.NOT_FOUND });
	}

	// 2. Validate leave type exists
	const leaveType = yield* attendanceRepo.findLeaveTypeById(input.leaveTypeId);
	if (leaveType === null) {
		return yield* new ENotFound({
			message: ATTENDANCE_MESSAGE.LEAVE_TYPE_NOT_FOUND,
		});
	}

	// 3. Gender restriction check
	if (
		leaveType.genderRestriction !== null &&
		leaveType.genderRestriction !== employee.gender
	) {
		return yield* new EBadRequest({
			message: ATTENDANCE_MESSAGE.LEAVE_GENDER_RESTRICTED,
		});
	}

	// 4. Date validation
	if (input.startDate > input.endDate) {
		return yield* new EBadRequest({
			message: ATTENDANCE_MESSAGE.LEAVE_END_BEFORE_START,
		});
	}

	// 5. Doctor note required check
	if (leaveType.requiresDoctorNote && !input.doctorNoteUrl) {
		return yield* new EBadRequest({
			message: ATTENDANCE_MESSAGE.LEAVE_DOCTOR_NOTE_REQUIRED,
		});
	}

	// 6. Check for overlapping leave requests
	const overlaps = yield* attendanceRepo.countOverlappingLeaveRequests(
		input.employeeId,
		input.startDate,
		input.endDate,
	);
	if (overlaps > 0) {
		return yield* new EConflict({
			message: ATTENDANCE_MESSAGE.LEAVE_DATE_OVERLAP,
		});
	}

	// 7. Calculate working days
	const totalDays = calculateWorkingDays(input.startDate, input.endDate);

	// 8. Annual leave eligibility check
	if (leaveType.code === LEAVE_CODE.ANNUAL) {
		const eligible = isAnnualLeaveEligible(
			employee.joinDate,
			new Date().toISOString().split("T")[0] ?? input.startDate,
		);
		if (!eligible) {
			return yield* new EBadRequest({
				message: ATTENDANCE_MESSAGE.LEAVE_BALANCE_NOT_ELIGIBLE,
			});
		}

		// Check balance
		const year = new Date(input.startDate).getFullYear();
		const balance = yield* attendanceRepo.findLeaveBalance(
			input.employeeId,
			input.leaveTypeId,
			year,
		);

		if (balance !== null) {
			const available =
				balance.allocatedDays +
				balance.carryOverDays -
				balance.usedDays -
				balance.pendingDays -
				balance.forfeitedDays;

			if (available < totalDays) {
				return yield* new EBadRequest({
					message: ATTENDANCE_MESSAGE.LEAVE_INSUFFICIENT_BALANCE,
				});
			}

			// Update pending days
			yield* attendanceRepo.updateLeaveBalance(balance.id, {
				pendingDays: balance.pendingDays + totalDays,
			});
		}
	}

	// 9. Create the leave request
	const row = yield* attendanceRepo.createLeaveRequest({
		employeeId: input.employeeId,
		leaveTypeId: input.leaveTypeId,
		startDate: input.startDate,
		endDate: input.endDate,
		totalDays,
		reason: input.reason ?? null,
		doctorNoteUrl: input.doctorNoteUrl ?? null,
		attachmentUrl: input.attachmentUrl ?? null,
		status: LEAVE_REQUEST_STATUS.PENDING,
		approverId: null,
		approvedAt: null,
		rejectionReason: null,
		salaryPercentageAtTime: leaveType.salaryPercentage,
		notes: null,
	});

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.LEAVE_REQUEST_CREATE,
		resourceType: ACTIVITY_RESOURCE_TYPE.LEAVE_REQUEST,
		resourceId: row.id,
		metadata: {
			employeeId: input.employeeId,
			leaveTypeCode: leaveType.code,
			startDate: input.startDate,
			endDate: input.endDate,
			totalDays,
		},
	});

	return toLeaveRequestDto(row, leaveType.name);
});
