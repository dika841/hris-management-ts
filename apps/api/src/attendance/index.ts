import { attendanceRepoLayer } from "#/attendance/infrastructure/attendance-repository.ts";
import { attendanceRouterBuild } from "#/attendance/presentation/attendance-router.ts";

export const attendanceModule: {
	layer: typeof attendanceRepoLayer;
	routerBuild: typeof attendanceRouterBuild;
} = {
	layer: attendanceRepoLayer,
	routerBuild: attendanceRouterBuild,
};
