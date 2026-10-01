import { z } from "zod";
import { baseSchema, type TEntityOf } from "../shared/base-schema.ts";
import { employeeIdSchema } from "./employee.ts";

export const contractIdSchema = z.string().min(1);

export const CONTRACT_TYPE = {
	PKWT: "pkwt",
	PKWTT: "pkwtt",
	INTERNSHIP: "internship",
	FREELANCE: "freelance",
} as const;
export type TContractType = (typeof CONTRACT_TYPE)[keyof typeof CONTRACT_TYPE];

export const contractTypeSchema = z.enum([
	CONTRACT_TYPE.PKWT,
	CONTRACT_TYPE.PKWTT,
	CONTRACT_TYPE.INTERNSHIP,
	CONTRACT_TYPE.FREELANCE,
]);

export const CONTRACT_STATUS = {
	ACTIVE: "active",
	RENEWED: "renewed",
	CONVERTED: "converted",
	EXPIRED: "expired",
	TERMINATED: "terminated",
} as const;
export type TContractStatus =
	(typeof CONTRACT_STATUS)[keyof typeof CONTRACT_STATUS];

export const contractStatusSchema = z.enum([
	CONTRACT_STATUS.ACTIVE,
	CONTRACT_STATUS.RENEWED,
	CONTRACT_STATUS.CONVERTED,
	CONTRACT_STATUS.EXPIRED,
	CONTRACT_STATUS.TERMINATED,
]);

export const employeeContractSchema = baseSchema(contractIdSchema).extend({
	employeeId: employeeIdSchema,
	contractType: contractTypeSchema,
	contractNumber: z.string(),
	startDate: z.string(), // YYYY-MM-DD
	endDate: z.string().nullable(), // YYYY-MM-DD (null for pkwtt)
	probationEndDate: z.string().nullable(), // YYYY-MM-DD (null for pkwt)
	basicSalary: z.number().int().nonnegative(),
	fixedAllowance: z.number().int().nonnegative(),
	position: z.string(),
	department: z.string(),
	status: contractStatusSchema,
	compensationAmount: z.number().int().nonnegative(),
	compensationPaid: z.boolean(),
	compensationPaidAt: z.string().nullable(),
	documentUrl: z.string().nullable(),
	notes: z.string().nullable(),
});
export type TEmployeeContract = TEntityOf<
	z.infer<typeof employeeContractSchema>
>;

export const contractCreateInputSchema = z.object({
	employeeId: employeeIdSchema,
	contractType: contractTypeSchema,
	contractNumber: z.string().min(1).max(100),
	startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	endDate: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/)
		.optional(),
	probationEndDate: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/)
		.optional(),
	basicSalary: z.number().int().positive(),
	fixedAllowance: z.number().int().nonnegative().default(0),
	position: z.string().min(1).max(100),
	department: z.string().min(1).max(100),
	documentUrl: z.string().optional(),
	notes: z.string().max(500).optional(),
});
export type TContractCreateInput = z.infer<typeof contractCreateInputSchema>;

export const contractRenewInputSchema = z.object({
	previousContractId: contractIdSchema,
	contractNumber: z.string().min(1).max(100),
	startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	basicSalary: z.number().int().positive(),
	fixedAllowance: z.number().int().nonnegative().default(0),
	position: z.string().min(1).max(100),
	department: z.string().min(1).max(100),
	notes: z.string().max(500).optional(),
});
export type TContractRenewInput = z.infer<typeof contractRenewInputSchema>;

export const contractConvertInputSchema = z.object({
	previousContractId: contractIdSchema,
	contractNumber: z.string().min(1).max(100),
	effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	basicSalary: z.number().int().positive(),
	fixedAllowance: z.number().int().nonnegative().default(0),
	position: z.string().min(1).max(100),
	department: z.string().min(1).max(100),
	notes: z.string().max(500).optional(),
});
export type TContractConvertInput = z.infer<typeof contractConvertInputSchema>;

export const contractPayCompensationInputSchema = z.object({
	contractId: contractIdSchema,
	notes: z.string().optional(),
});
export type TContractPayCompensationInput = z.infer<
	typeof contractPayCompensationInputSchema
>;
