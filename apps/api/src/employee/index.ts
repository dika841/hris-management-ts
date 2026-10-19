import { employeeRepoLayer } from "#/employee/infrastructure/employee-repository.ts";
import { employeeRouterBuild } from "#/employee/presentation/employee-router.ts";

export const employeeModule: {
	layer: typeof employeeRepoLayer;
	routerBuild: typeof employeeRouterBuild;
} = {
	layer: employeeRepoLayer,
	routerBuild: employeeRouterBuild,
};

export {
	EmployeeRepo,
	type TEmployeeRepoId,
	type TEmployeeRepo,
	type TEmployeeRow,
} from "#/employee/domain/employee.ts";

export { employeeGetByUserId } from "#/employee/application/employee-get-by-user-id.ts";
export { toEmployeeDto } from "#/employee/application/to-employee-dto.ts";
