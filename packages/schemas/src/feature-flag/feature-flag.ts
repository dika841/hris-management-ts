import { z } from "zod";

const keySchema = z
	.string()
	.min(1)
	.max(100)
	.regex(
		/^[a-z][a-z0-9_.-]*$/,
		"Key must start with a lowercase letter and contain only lowercase letters, numbers, dots, underscores, or hyphens.",
	);

const descriptionSchema = z.string().max(500).nullable();

export const featureFlagSchema = z.object({
	id: z.string(),
	key: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	enabled: z.boolean(),
	rolloutPercentage: z.number().int().min(0).max(100),
	createdAt: z.string(),
	updatedAt: z.string(),
});
export type TFeatureFlag = z.infer<typeof featureFlagSchema>;

export const featureFlagCreateInputSchema = z.object({
	key: keySchema,
	name: z.string().min(1).max(120),
	description: descriptionSchema.optional(),
	enabled: z.boolean().optional(),
	rolloutPercentage: z.number().int().min(0).max(100).optional(),
});
export type TFeatureFlagCreateInput = z.infer<
	typeof featureFlagCreateInputSchema
>;

export const featureFlagUpdateInputSchema = z.object({
	name: z.string().min(1).max(120).optional(),
	description: descriptionSchema.optional(),
	enabled: z.boolean().optional(),
	rolloutPercentage: z.number().int().min(0).max(100).optional(),
});
export type TFeatureFlagUpdateInput = z.infer<
	typeof featureFlagUpdateInputSchema
>;

export const featureFlagUpdateWithIdInputSchema =
	featureFlagUpdateInputSchema.extend({
		id: z.string(),
	});
export type TFeatureFlagUpdateWithIdInput = z.infer<
	typeof featureFlagUpdateWithIdInputSchema
>;

export const featureFlagIdInputSchema = z.object({
	id: z.string(),
});
export type TFeatureFlagIdInput = z.infer<typeof featureFlagIdInputSchema>;

export const featureFlagListSchema = z.array(featureFlagSchema);
export type TFeatureFlagList = z.infer<typeof featureFlagListSchema>;

export const featureFlagEvaluationSchema = z.array(
	z.object({
		key: z.string(),
		enabled: z.boolean(),
	}),
);
export type TFeatureFlagEvaluation = z.infer<
	typeof featureFlagEvaluationSchema
>;
