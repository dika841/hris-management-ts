import { z } from "zod";
import {
	aiDecisionStatusSchema,
	aiRiskLevelSchema,
} from "../ai-governance/ai-governance.ts";

export const aiAssistInputSchema = z.object({
	feature: z.string().min(1).max(100),
	message: z.string().min(1).max(8000),
	context: z.unknown().optional(),
	subjectType: z.string().min(1).max(50).optional(),
	subjectId: z.string().min(1).max(120).optional(),
});
export type TAiAssistInput = z.infer<typeof aiAssistInputSchema>;

export const aiAssistOutputSchema = z.object({
	decisionId: z.string(),
	model: z.string(),
	summary: z.string(),
	recommendation: z.string(),
	riskLevel: aiRiskLevelSchema,
	confidence: z.number().int().min(0).max(100),
	status: aiDecisionStatusSchema,
	redactionApplied: z.boolean(),
});
export type TAiAssistOutput = z.infer<typeof aiAssistOutputSchema>;
