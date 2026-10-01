import {
	type TLeaveBalance,
	type TLeaveRequest,
	type TLeaveType,
	leaveBalanceSchema,
	leaveRequestSchema,
	leaveTypeSchema,
} from "@app/schemas";
import type {
	TLeaveBalanceRow,
	TLeaveRequestRow,
	TLeaveTypeRow,
} from "#/attendance/domain/attendance.ts";

export const toLeaveTypeDto = (row: TLeaveTypeRow): TLeaveType =>
	leaveTypeSchema.parse({
		id: row.id,
		code: row.code,
		name: row.name,
		category: row.category,
		description: row.description,
		defaultDays: row.defaultDays,
		requiresDoctorNote: row.requiresDoctorNote,
		requiresSpouseNote: row.requiresSpouseNote,
		genderRestriction: row.genderRestriction,
		salaryPercentage: row.salaryPercentage,
		isActive: row.isActive,
		isSystem: row.isSystem,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	});

export const toLeaveBalanceDto = (row: TLeaveBalanceRow): TLeaveBalance =>
	leaveBalanceSchema.parse({
		id: row.id,
		employeeId: row.employeeId,
		leaveTypeId: row.leaveTypeId,
		year: row.year,
		allocatedDays: row.allocatedDays,
		carryOverDays: row.carryOverDays,
		usedDays: row.usedDays,
		pendingDays: row.pendingDays,
		forfeitedDays: row.forfeitedDays,
		remainingDays:
			row.allocatedDays +
			row.carryOverDays -
			row.usedDays -
			row.pendingDays -
			row.forfeitedDays,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	});

export const toLeaveRequestDto = (
	row: TLeaveRequestRow,
	leaveTypeName?: string,
): TLeaveRequest =>
	leaveRequestSchema.parse({
		id: row.id,
		employeeId: row.employeeId,
		leaveTypeId: row.leaveTypeId,
		leaveTypeName,
		startDate: row.startDate,
		endDate: row.endDate,
		totalDays: row.totalDays,
		reason: row.reason,
		doctorNoteUrl: row.doctorNoteUrl,
		attachmentUrl: row.attachmentUrl,
		status: row.status,
		approverId: row.approverId,
		approvedAt: row.approvedAt ? row.approvedAt.toISOString() : null,
		rejectionReason: row.rejectionReason,
		salaryPercentageAtTime: row.salaryPercentageAtTime,
		notes: row.notes,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	});
