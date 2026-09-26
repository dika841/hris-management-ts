const RESOURCE = {
	USERS: "/users",
	ROLES: "/roles",
	EMPLOYEES: "/employees",
	PAYROLL: "/payroll",
} as const;

export const ROUTE_PATH = {
	HEALTH: "/health",
	HEALTHZ: "/healthz",
	READY: "/ready",
	METRICS: "/metrics",
	ME: "/me",
	PERMISSIONS: "/permissions",
	ACTIVITY: "/activity",
	USERS: RESOURCE.USERS,
	USER: `${RESOURCE.USERS}/{id}`,
	USER_PASSWORD: `${RESOURCE.USERS}/{id}/password`,
	ROLES: RESOURCE.ROLES,
	ROLE: `${RESOURCE.ROLES}/{key}`,
	EMPLOYEES: RESOURCE.EMPLOYEES,
	EMPLOYEE: `${RESOURCE.EMPLOYEES}/{id}`,
	PAYROLL_PERIODS: `${RESOURCE.PAYROLL}/periods`,
	PAYROLL_PERIOD: `${RESOURCE.PAYROLL}/periods/{id}`,
	PAYROLL_CALCULATE: `${RESOURCE.PAYROLL}/calculate`,
	PAYROLL_ITEMS: `${RESOURCE.PAYROLL}/items`,
	PAYROLL_ITEM: `${RESOURCE.PAYROLL}/items/{id}`,
	PAYROLL_SIMULATE: `${RESOURCE.PAYROLL}/simulate`,
} as const;
export type TRoutePath = (typeof ROUTE_PATH)[keyof typeof ROUTE_PATH];

const OPENAPI_PREFIX = "/api";

export const ROUTE_PREFIX = {
	RPC: "/rpc",
	OPENAPI: OPENAPI_PREFIX,
	AUTH: `${OPENAPI_PREFIX}/auth`,
} as const;
