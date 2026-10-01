import { z } from "zod";
import { baseSchema, type TEntityOf } from "../shared/base-schema.ts";

export const departmentIdSchema = z.string().min(1);
export const positionIdSchema = z.string().min(1);

export const departmentSchema = baseSchema(departmentIdSchema).extend({
	code: z.string(),
	name: z.string(),
	description: z.string().nullable(),
});
export type TDepartment = TEntityOf<z.infer<typeof departmentSchema>>;

export const departmentCreateInputSchema = z.object({
	code: z.string().min(1).max(50),
	name: z.string().min(1).max(100),
	description: z.string().max(255).optional(),
});
export type TDepartmentCreateInput = z.infer<
	typeof departmentCreateInputSchema
>;

export const positionSchema = baseSchema(positionIdSchema).extend({
	departmentId: departmentIdSchema.nullable(),
	code: z.string(),
	title: z.string(),
});
export type TPosition = TEntityOf<z.infer<typeof positionSchema>>;

export const positionCreateInputSchema = z.object({
	departmentId: departmentIdSchema.optional(),
	code: z.string().min(1).max(50),
	title: z.string().min(1).max(100),
});
export type TPositionCreateInput = z.infer<typeof positionCreateInputSchema>;
