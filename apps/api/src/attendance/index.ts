import { attendanceRepoLayer } from "#/attendance/infrastructure/attendance-repository.ts";
import { attendanceRouterBuild } from "#/attendance/presentation/attendance-router.ts";

export {
	AttendanceRepo,
	type TAttendanceRepoId,
} from "#/attendance/domain/attendance.ts";

export const attendanceModule: {
	layer: typeof attendanceRepoLayer;
	routerBuild: typeof attendanceRouterBuild;
} = {
	layer: attendanceRepoLayer,
	routerBuild: attendanceRouterBuild,
};

export { attendanceList } from "#/attendance/application/attendance-list.ts";
export { attendanceSummary } from "#/attendance/application/attendance-summary.ts";
export { attendanceLog } from "#/attendance/application/attendance-log.ts";
export { leaveRequestList } from "#/attendance/application/leave-request-list.ts";
export { leaveRequestCreate } from "#/attendance/application/leave-request-create.ts";
export { leaveRequestCancel } from "#/attendance/application/leave-request-cancel.ts";
export { overtimeList } from "#/attendance/application/overtime-list.ts";
export { overtimeCreate } from "#/attendance/application/overtime-create.ts";
export { overtimeCancel } from "#/attendance/application/overtime-cancel.ts";

export {
	toLeaveTypeDto,
	toLeaveBalanceDto,
} from "#/attendance/application/to-leave-dto.ts";
