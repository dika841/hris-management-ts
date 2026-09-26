import { z } from "zod";
import { userIdSchema } from "../auth/auth.ts";
import { baseSchema, type TEntityOf } from "../shared/base-schema.ts";
import { paginated, paginationSchema } from "../shared/pagination.ts";
import { searchQuerySchema } from "../shared/search.ts";
import { SORT_DIRECTION, sortDirectionSchema } from "../shared/sort.ts";

export const employeeIdSchema = z.string().min(1);

export const PTKP_CODE = {
	TK_0: "TK/0",
	TK_1: "TK/1",
	TK_2: "TK/2",
	TK_3: "TK/3",
	K_0: "K/0",
	K_1: "K/1",
	K_2: "K/2",
	K_3: "K/3",
} as const;
export type TPtkpCode = (typeof PTKP_CODE)[keyof typeof PTKP_CODE];

export const TER_CATEGORY = {
	A: "TER_A",
	B: "TER_B",
	C: "TER_C",
} as const;
export type TTerCategory = (typeof TER_CATEGORY)[keyof typeof TER_CATEGORY];

export const TAX_METHOD = {
	GROSS: "gross",
	NETT: "nett",
	GROSS_UP: "gross_up",
} as const;
export type TTaxMethod = (typeof TAX_METHOD)[keyof typeof TAX_METHOD];

export const EMPLOYMENT_STATUS = {
	PERMANENT: "permanent",
	CONTRACT: "contract",
	PROBATION: "probation",
	INTERN: "intern",
} as const;
export type TEmploymentStatus =
	(typeof EMPLOYMENT_STATUS)[keyof typeof EMPLOYMENT_STATUS];

export const GENDER = {
	MALE: "male",
	FEMALE: "female",
} as const;
export type TGender = (typeof GENDER)[keyof typeof GENDER];

export const ptkpCodeSchema = z.enum([
	PTKP_CODE.TK_0,
	PTKP_CODE.TK_1,
	PTKP_CODE.TK_2,
	PTKP_CODE.TK_3,
	PTKP_CODE.K_0,
	PTKP_CODE.K_1,
	PTKP_CODE.K_2,
	PTKP_CODE.K_3,
]);

export const taxMethodSchema = z.enum([
	TAX_METHOD.GROSS,
	TAX_METHOD.NETT,
	TAX_METHOD.GROSS_UP,
]);

export const employmentStatusSchema = z.enum([
	EMPLOYMENT_STATUS.PERMANENT,
	EMPLOYMENT_STATUS.CONTRACT,
	EMPLOYMENT_STATUS.PROBATION,
	EMPLOYMENT_STATUS.INTERN,
]);

export const genderSchema = z.enum([GENDER.MALE, GENDER.FEMALE]);

export const employeeSchema = baseSchema(employeeIdSchema).extend({
	userId: userIdSchema.nullable(),
	employeeCode: z.string(),
	idCardNumber: z.string(), // NIK KTP
	fullName: z.string(),
	email: z.string().email(),
	phone: z.string().nullable(),
	gender: genderSchema,
	dateOfBirth: z.string(), // YYYY-MM-DD
	department: z.string(),
	position: z.string(),
	employmentStatus: employmentStatusSchema,
	joinDate: z.string(), // YYYY-MM-DD
	endDate: z.string().nullable(),
	// Data Finansial & Penggajian
	basicSalary: z.number().int().nonnegative(), // dalam Rupiah
	taxMethod: taxMethodSchema,
	ptkpCode: ptkpCodeSchema,
	npwp: z.string().nullable(),
	bankName: z.string().nullable(),
	bankAccountNumber: z.string().nullable(),
	bankAccountHolder: z.string().nullable(),
	// BPJS
	bpjsKesehatanNumber: z.string().nullable(),
	bpjsKetenagakerjaanNumber: z.string().nullable(),
	jkkRiskGrade: z.number().min(1).max(5).default(1), // Level risiko kecelakaan kerja JKK (1: 0.24% s/d 5: 1.74%)
	// Kepatuhan UU PDP
	pdpConsentGiven: z.boolean().default(false),
	pdpConsentDate: z.string().nullable(),
});
export type TEmployee = TEntityOf<z.infer<typeof employeeSchema>>;

export const employeeCreateInputSchema = z.object({
	userId: userIdSchema.optional(),
	employeeCode: z.string().min(1).max(50),
	idCardNumber: z.string().min(16).max(20),
	fullName: z.string().min(1).max(100),
	email: z.string().email(),
	phone: z.string().max(20).optional(),
	gender: genderSchema,
	dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	department: z.string().min(1).max(100),
	position: z.string().min(1).max(100),
	employmentStatus: employmentStatusSchema.default(EMPLOYMENT_STATUS.PERMANENT),
	joinDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
	managerId: employeeIdSchema.optional(),
	basicSalary: z.number().int().nonnegative(),
	taxMethod: taxMethodSchema.default(TAX_METHOD.GROSS),
	ptkpCode: ptkpCodeSchema.default(PTKP_CODE.TK_0),
	npwp: z.string().max(30).optional(),
	bankName: z.string().max(50).optional(),
	bankAccountNumber: z.string().max(50).optional(),
	bankAccountHolder: z.string().max(100).optional(),
	bpjsKesehatanNumber: z.string().max(50).optional(),
	bpjsKetenagakerjaanNumber: z.string().max(50).optional(),
	jkkRiskGrade: z.number().min(1).max(5).default(1),
	pdpConsentGiven: z.boolean().default(true),
});
export type TEmployeeCreateInput = z.infer<typeof employeeCreateInputSchema>;

export const employeeUpdateInputSchema = employeeCreateInputSchema.partial().extend({
	id: employeeIdSchema,
});
export type TEmployeeUpdateInput = z.infer<typeof employeeUpdateInputSchema>;

export const employeeIdInputSchema = z.object({ id: employeeIdSchema });
export type TEmployeeIdInput = z.infer<typeof employeeIdInputSchema>;

export const EMPLOYEE_SORT = {
	EMPLOYEE_CODE: "employeeCode",
	FULL_NAME: "fullName",
	DEPARTMENT: "department",
	POSITION: "position",
	JOIN_DATE: "joinDate",
	CREATED_AT: "createdAt",
} as const;
export type TEmployeeSort = (typeof EMPLOYEE_SORT)[keyof typeof EMPLOYEE_SORT];

export const employeeListInputSchema = paginationSchema.extend({
	search: searchQuerySchema.optional(),
	department: z.string().optional(),
	employmentStatus: employmentStatusSchema.optional(),
	sortBy: z
		.enum([
			EMPLOYEE_SORT.EMPLOYEE_CODE,
			EMPLOYEE_SORT.FULL_NAME,
			EMPLOYEE_SORT.DEPARTMENT,
			EMPLOYEE_SORT.POSITION,
			EMPLOYEE_SORT.JOIN_DATE,
			EMPLOYEE_SORT.CREATED_AT,
		])
		.default(EMPLOYEE_SORT.CREATED_AT),
	sortDir: sortDirectionSchema.default(SORT_DIRECTION.ASC),
});
export type TEmployeeListInput = z.infer<typeof employeeListInputSchema>;

export const employeeListSchema = paginated(employeeSchema);
export type TEmployeeList = z.infer<typeof employeeListSchema>;
