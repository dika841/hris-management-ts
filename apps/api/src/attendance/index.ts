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
