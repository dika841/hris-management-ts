import { payrollRepoLayer } from "#/payroll/infrastructure/payroll-repository.ts";
import { payrollRouterBuild } from "#/payroll/presentation/payroll-router.ts";

export * from "#/payroll/domain/bpjs-calculator.ts";
export * from "#/payroll/domain/overtime-calculator.ts";
export * from "#/payroll/domain/payroll-calculator.ts";
export * from "#/payroll/domain/pph21-ter.ts";

export const payrollModule: {
	layer: typeof payrollRepoLayer;
	routerBuild: typeof payrollRouterBuild;
} = {
	layer: payrollRepoLayer,
	routerBuild: payrollRouterBuild,
};
