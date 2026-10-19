import { ROLE } from "@app/permissions";
import { LEAVE_CODE, type TUserCreateInput } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { match, P } from "ts-pattern";
import { runtime } from "#/bootstrap/compose.ts";
import {
	AuthService,
	type TAuthServiceId,
} from "#/auth/infrastructure/auth-service.ts";
import { env } from "#/platform/config/env.ts";
import { DbService, type TDbServiceId } from "#/platform/db/db-service.ts";
import { user } from "#/platform/db/tables/auth.ts";
import { leaveType, publicHoliday } from "#/platform/db/tables/attendance.ts";
import {
	department,
	employee,
	position,
} from "#/platform/db/tables/employee.ts";
import { logger } from "#/platform/observability/logger.ts";
import { seedPlanFor, type TSeedPlan } from "#/scripts/seed-plan.ts";

const EXIT_OK = 0;
const EXIT_FAILURE = 1;

const adminUserFor = (password: string): TUserCreateInput => ({
	name: "Admin",
	email: "admin@test.app",
	password,
	role: ROLE.ADMIN,
});

const demoUsersFor = (password: string): readonly TUserCreateInput[] => [
	{ name: "Member", email: "member@test.app", password, role: ROLE.MEMBER },
	{ name: "Viewer", email: "viewer@test.app", password, role: ROLE.VIEWER },
];

const LEAVE_TYPE_SEED = [
	{
		code: LEAVE_CODE.ANNUAL,
		name: "Cuti Tahunan",
		category: "paid",
		defaultDays: 12,
		salaryPercentage: 100,
	},
	{
		code: LEAVE_CODE.SICK,
		name: "Sakit",
		category: "paid",
		defaultDays: 30,
		requiresDoctorNote: true,
		salaryPercentage: 100,
	},
	{
		code: LEAVE_CODE.MATERNITY,
		name: "Cuti Melahirkan",
		category: "special_paid",
		defaultDays: 90,
		requiresDoctorNote: true,
		genderRestriction: "female",
		salaryPercentage: 100,
	},
	{
		code: LEAVE_CODE.PATERNITY,
		name: "Cuti Ayah",
		category: "special_paid",
		defaultDays: 3,
		genderRestriction: "male",
		salaryPercentage: 100,
	},
	{
		code: LEAVE_CODE.MENSTRUAL,
		name: "Cuti Haid",
		category: "special_paid",
		defaultDays: 2,
		genderRestriction: "female",
		salaryPercentage: 100,
	},
	{
		code: LEAVE_CODE.MISCARRIAGE,
		name: "Cuti Keguguran",
		category: "special_paid",
		defaultDays: 45,
		requiresDoctorNote: true,
		genderRestriction: "female",
		salaryPercentage: 100,
	},
	{
		code: LEAVE_CODE.LONG_SICK,
		name: "Sakit Berkepanjangan",
		category: "paid",
		defaultDays: 0,
		requiresDoctorNote: true,
		salaryPercentage: 100,
	},
	{
		code: LEAVE_CODE.EMERGENCY,
		name: "Izin Darurat",
		category: "paid",
		defaultDays: 0,
		salaryPercentage: 100,
	},
	{
		code: LEAVE_CODE.UNPAID,
		name: "Cuti Tanpa Upah",
		category: "unpaid",
		defaultDays: 0,
		salaryPercentage: 0,
	},
] as const;

const referenceSeed = (): Effect.Effect<void, never, TDbServiceId> =>
	Effect.gen(function* () {
		const { db } = yield* DbService;

		yield* Effect.promise(async () => {
			await db
				.insert(leaveType)
				.values(
					LEAVE_TYPE_SEED.map((item) => ({
						...item,
						isSystem: true,
						isActive: true,
					})),
				)
				.onConflictDoNothing({ target: leaveType.code });

			await db
				.insert(department)
				.values([
					{
						code: "ENG",
						name: "Engineering",
						description: "Product & engineering",
					},
					{
						code: "HR",
						name: "Human Resources",
						description: "People operations",
					},
					{ code: "FIN", name: "Finance", description: "Finance & accounting" },
				])
				.onConflictDoNothing({ target: department.code });

			const departments = await db.select().from(department);
			const departmentByCode = new Map(
				departments.map((row) => [row.code, row.id]),
			);

			await db
				.insert(position)
				.values([
					{
						code: "SE",
						title: "Software Engineer",
						departmentId: departmentByCode.get("ENG") ?? null,
					},
					{
						code: "HR-OFFICER",
						title: "HR Officer",
						departmentId: departmentByCode.get("HR") ?? null,
					},
					{
						code: "FIN-STAFF",
						title: "Finance Staff",
						departmentId: departmentByCode.get("FIN") ?? null,
					},
				])
				.onConflictDoNothing({ target: position.code });

			const year = new Date().getFullYear();
			await db
				.insert(publicHoliday)
				.values([
					{ date: `${year}-01-01`, name: "Tahun Baru Masehi", year },
					{ date: `${year}-05-01`, name: "Hari Buruh Internasional", year },
					{ date: `${year}-08-17`, name: "Hari Kemerdekaan RI", year },
					{ date: `${year}-12-25`, name: "Hari Raya Natal", year },
				])
				.onConflictDoNothing({ target: publicHoliday.date });
		});
	});

const demoEmployeeSeed = (): Effect.Effect<void, never, TDbServiceId> =>
	Effect.gen(function* () {
		const { db } = yield* DbService;
		const year = new Date().getFullYear();

		yield* Effect.promise(async () => {
			await db
				.insert(employee)
				.values([
					{
						employeeCode: "EMP-001",
						idCardNumber: "3171010101900001",
						fullName: "Budi Pratama",
						email: "budi.pratama@perusahaan.co.id",
						phone: "081234567890",
						gender: "male",
						dateOfBirth: "1990-01-01",
						department: "Engineering",
						position: "Software Engineer",
						employmentStatus: "permanent",
						joinDate: "2024-01-15",
						basicSalary: 12_000_000,
						taxMethod: "gross",
						ptkpCode: "TK/0",
						pdpConsentGiven: true,
						pdpConsentDate: new Date(),
					},
					{
						employeeCode: "EMP-002",
						idCardNumber: "3171010202920002",
						fullName: "Siti Rahma",
						email: "siti.rahma@perusahaan.co.id",
						phone: "081234567891",
						gender: "female",
						dateOfBirth: "1992-02-02",
						department: "Human Resources",
						position: "HR Officer",
						employmentStatus: "contract",
						joinDate: "2024-03-01",
						endDate: `${year + 1}-06-30`,
						basicSalary: 8_500_000,
						taxMethod: "gross_up",
						ptkpCode: "K/1",
						pdpConsentGiven: true,
						pdpConsentDate: new Date(),
					},
					{
						employeeCode: "EMP-003",
						idCardNumber: "3171010303930003",
						fullName: "Andi Wijaya",
						email: "andi.wijaya@perusahaan.co.id",
						phone: "081234567892",
						gender: "male",
						dateOfBirth: "1993-03-03",
						department: "Finance",
						position: "Finance Staff",
						employmentStatus: "probation",
						joinDate: `${year}-01-01`,
						basicSalary: 7_000_000,
						taxMethod: "nett",
						ptkpCode: "TK/1",
						pdpConsentGiven: true,
						pdpConsentDate: new Date(),
					},
					{
						employeeCode: "EMP-004",
						idCardNumber: "3171010404040004",
						fullName: "Rina Lestari",
						email: "rina.lestari@perusahaan.co.id",
						phone: "081234567893",
						gender: "female",
						dateOfBirth: "2004-04-04",
						department: "Engineering",
						position: "Software Engineer",
						employmentStatus: "intern",
						joinDate: `${year}-02-01`,
						basicSalary: 4_000_000,
						taxMethod: "gross",
						ptkpCode: "TK/0",
						pdpConsentGiven: false,
						pdpConsentDate: null,
					},
				])
				.onConflictDoNothing({ target: employee.employeeCode });
		});
	});

const userEnsure = (
	seedUser: TUserCreateInput,
): Effect.Effect<string, never, TDbServiceId | TAuthServiceId> =>
	Effect.gen(function* () {
		const { db } = yield* DbService;
		const { auth } = yield* AuthService;

		const existing = yield* Effect.promise(() =>
			db.select().from(user).where(eq(user.email, seedUser.email)).limit(1),
		);

		return yield* match(existing[0])
			.with(P.nonNullable, (found) => Effect.succeed(found.id))
			.otherwise(() =>
				Effect.promise(async () => {
					const result = await auth.api.signUpEmail({
						body: {
							email: seedUser.email,
							password: seedUser.password,
							name: seedUser.name,
						},
					});
					await db
						.update(user)
						.set({ role: seedUser.role })
						.where(eq(user.id, result.user.id));
					return result.user.id;
				}),
			);
	});

const demoSeed = (
	password: string,
): Effect.Effect<void, never, TDbServiceId | TAuthServiceId> =>
	Effect.gen(function* () {
		yield* Effect.forEach(demoUsersFor(password), userEnsure);
		yield* demoEmployeeSeed();
	});

const seedRun = (
	plan: TSeedPlan,
): Effect.Effect<void, never, TDbServiceId | TAuthServiceId> =>
	Effect.gen(function* () {
		const admin = adminUserFor(plan.password);
		yield* userEnsure(admin);
		yield* referenceSeed();

		yield* match(plan.demoData)
			.with(true, () => demoSeed(plan.password))
			.otherwise(() => Effect.void);

		const seeded = match(plan.demoData)
			.with(true, () => [admin, ...demoUsersFor(plan.password)])
			.otherwise(() => [admin]);

		logger.info(
			{
				users: A.map(seeded, (seedUser) => ({
					email: seedUser.email,
					role: seedUser.role,
				})),
				demoData: plan.demoData,
			},
			"seeded users",
		);
	});

await match(seedPlanFor(env))
	.with(P.nullish, (): Promise<void> => {
		logger.error(
			{ env: env.NODE_ENV },
			"seed refused: SEED_PASSWORD is required to seed a production database",
		);
		process.exit(EXIT_FAILURE);
	})
	.otherwise((plan): Promise<void> => runtime.runPromise(seedRun(plan)));

process.exit(EXIT_OK);
