import { z } from "zod";
import { paginated, paginationSchema } from "../shared/pagination.ts";

export const aiRiskLevelSchema = z.enum(["low", "medium", "high"]);
export type TAiRiskLevel = z.infer<typeof aiRiskLevelSchema>;

export const aiDecisionStatusSchema = z.enum([
	"pending_review",
	"approved",
	"rejected",
]);
export type TAiDecisionStatus = z.infer<typeof aiDecisionStatusSchema>;

export const aiDecisionSchema = z.object({
	id: z.string(),
	feature: z.string(),
	subjectType: z.string().nullable(),
	subjectId: z.string().nullable(),
	promptHash: z.string(),
	model: z.string(),
	decision: z.unknown(),
	confidence: z.number().int().min(0).max(100),
	riskLevel: aiRiskLevelSchema,
	status: aiDecisionStatusSchema,
	redactionApplied: z.boolean(),
	reviewedBy: z.string().nullable(),
	reviewedByName: z.string().nullable(),
	reviewedAt: z.string().nullable(),
	reviewNote: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});
export type TAiDecision = z.infer<typeof aiDecisionSchema>;

export const aiDecisionCreateInputSchema = z.object({
	feature: z.string().min(1).max(100),
	subjectType: z.string().min(1).max(50).optional(),
	subjectId: z.string().min(1).max(120).optional(),
	promptHash: z.string().min(16).max(128),
	model: z.string().min(1).max(100),
	decision: z.unknown(),
	confidence: z.number().int().min(0).max(100),
	riskLevel: aiRiskLevelSchema,
	redactionApplied: z.boolean().optional(),
	autoApprove: z.boolean().optional(),
});
export type TAiDecisionCreateInput = z.infer<
	typeof aiDecisionCreateInputSchema
>;

export const aiDecisionListInputSchema = paginationSchema.extend({
	status: aiDecisionStatusSchema.optional(),
	feature: z.string().max(100).optional(),
});
export type TAiDecisionListInput = z.infer<typeof aiDecisionListInputSchema>;

export const aiDecisionListSchema = paginated(aiDecisionSchema);
export type TAiDecisionList = z.infer<typeof aiDecisionListSchema>;

export const aiDecisionReviewInputSchema = z.object({
	id: z.string(),
	note: z.string().max(1000).optional(),
});
export type TAiDecisionReviewInput = z.infer<
	typeof aiDecisionReviewInputSchema
>;
