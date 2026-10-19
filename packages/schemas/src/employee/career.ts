import { z } from "zod";
import { eventSchema, type TEventOf } from "../shared/base-schema.ts";
import { employeeIdSchema } from "./employee.ts";

export const CAREER_CHANGE_TYPE = {
	HIRE: "hire",
	PROMOTION: "promotion",
	DEMOTION: "demotion",
	MUTATION: "mutation",
	SALARY_ADJUSTMENT: "salary_adjustment",
} as const;
export type TCareerChangeType =
	(typeof CAREER_CHANGE_TYPE)[keyof typeof CAREER_CHANGE_TYPE];

export const careerChangeTypeSchema = z.enum([
	CAREER_CHANGE_TYPE.HIRE,
	CAREER_CHANGE_TYPE.PROMOTION,
	CAREER_CHANGE_TYPE.DEMOTION,
	CAREER_CHANGE_TYPE.MUTATION,
	CAREER_CHANGE_TYPE.SALARY_ADJUSTMENT,
]);

export const employeeCareerHistorySchema = eventSchema(z.string()).extend({
	employeeId: employeeIdSchema,
	changeType: careerChangeTypeSchema,
	effectiveDate: z.string(),
	previousDepartment: z.string().nullable(),
	newDepartment: z.string(),
	previousPosition: z.string().nullable(),
	newPosition: z.string(),
	previousSalary: z.number().int().nonnegative().nullable(),
	newSalary: z.number().int().nonnegative(),
	notes: z.string().nullable(),
});
export type TEmployeeCareerHistory = TEventOf<
	z.infer<typeof employeeCareerHistorySchema>
>;

export const careerHistoryCreateInputSchema = z.object({
	employeeId: employeeIdSchema,
	changeType: careerChangeTypeSchema,
	effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	newDepartment: z.string().min(1).max(100),
	newPosition: z.string().min(1).max(100),
	newSalary: z.number().int().nonnegative(),
	notes: z.string().max(500).optional(),
});
export type TCareerHistoryCreateInput = z.infer<
	typeof careerHistoryCreateInputSchema
>;
