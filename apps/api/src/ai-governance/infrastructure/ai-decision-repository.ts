import { and, count, desc, eq, type SQL } from "drizzle-orm";
import { Effect, Layer } from "effect";
import { DbService, dbServiceLayer } from "#/platform/db/db-service.ts";
import { aiDecision } from "#/platform/db/tables/ai-governance.ts";
import { user } from "#/platform/db/tables/auth.ts";
import { dbActive } from "#/platform/db/transaction.ts";
import {
	AiDecisionRepo,
	type TAiDecisionRepo,
} from "#/ai-governance/domain/ai-governance.ts";
import type {
	TAiDecision,
	TAiDecisionListInput,
	TAiDecisionStatus,
	TAiRiskLevel,
} from "@app/schemas";
import { EDatabase } from "#/shared/errors.ts";

type TDecisionRow = {
	id: string;
	feature: string;
	subjectType: string | null;
	subjectId: string | null;
	promptHash: string;
	model: string;
	decision: unknown;
	confidence: number;
	riskLevel: string;
	status: string;
	redactionApplied: boolean;
	reviewedBy: string | null;
	reviewedByName: string | null;
	reviewedAt: Date | null;
	reviewNote: string | null;
	createdAt: Date;
	updatedAt: Date;
};

const toDto = (row: TDecisionRow): TAiDecision => ({
	id: row.id,
	feature: row.feature,
	subjectType: row.subjectType,
	subjectId: row.subjectId,
	promptHash: row.promptHash,
	model: row.model,
	decision: row.decision,
	confidence: row.confidence,
	riskLevel: row.riskLevel as TAiRiskLevel,
	status: row.status as TAiDecisionStatus,
	redactionApplied: row.redactionApplied,
	reviewedBy: row.reviewedBy,
	reviewedByName: row.reviewedByName,
	reviewedAt: row.reviewedAt?.toISOString() ?? null,
	reviewNote: row.reviewNote,
	createdAt: row.createdAt.toISOString(),
	updatedAt: row.updatedAt.toISOString(),
});

const selection = {
	id: aiDecision.id,
	feature: aiDecision.feature,
	subjectType: aiDecision.subjectType,
	subjectId: aiDecision.subjectId,
	promptHash: aiDecision.promptHash,
	model: aiDecision.model,
	decision: aiDecision.decision,
	confidence: aiDecision.confidence,
	riskLevel: aiDecision.riskLevel,
	status: aiDecision.status,
	redactionApplied: aiDecision.redactionApplied,
	reviewedBy: aiDecision.reviewedBy,
	reviewedByName: user.name,
	reviewedAt: aiDecision.reviewedAt,
	reviewNote: aiDecision.reviewNote,
	createdAt: aiDecision.createdAt,
	updatedAt: aiDecision.updatedAt,
};

export const aiDecisionRepoLayer = Layer.effect(
	AiDecisionRepo,
	Effect.gen(function* () {
		const { db } = yield* DbService;

		const list: TAiDecisionRepo["list"] = (input: TAiDecisionListInput) =>
			Effect.tryPromise({
				try: async () => {
					const conditions: SQL[] = [];
					if (input.status !== undefined) {
						conditions.push(eq(aiDecision.status, input.status));
					}
					if (input.feature !== undefined && input.feature !== "") {
						conditions.push(eq(aiDecision.feature, input.feature));
					}
					const where = conditions.length > 0 ? and(...conditions) : undefined;
					const rows = await dbActive(db)
						.select(selection)
						.from(aiDecision)
						.leftJoin(user, eq(aiDecision.reviewedBy, user.id))
						.where(where)
						.orderBy(desc(aiDecision.createdAt))
						.limit(input.pageSize)
						.offset((input.page - 1) * input.pageSize);
					const totals = await dbActive(db)
						.select({ value: count() })
						.from(aiDecision)
						.where(where);
					return {
						items: rows.map(toDto),
						total: totals[0]?.value ?? 0,
						page: input.page,
						pageSize: input.pageSize,
					};
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const findById: TAiDecisionRepo["findById"] = (id) =>
			Effect.tryPromise({
				try: async () => {
					const rows = await dbActive(db)
						.select(selection)
						.from(aiDecision)
						.leftJoin(user, eq(aiDecision.reviewedBy, user.id))
						.where(eq(aiDecision.id, id))
						.limit(1);
					return rows[0] === undefined ? null : toDto(rows[0]);
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const create: TAiDecisionRepo["create"] = (input) =>
			Effect.tryPromise({
				try: async () => {
					const rows = await dbActive(db)
						.insert(aiDecision)
						.values(input)
						.returning();
					const created = rows[0]!;
					return toDto({
						...created,
						reviewedByName: null,
					});
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const review: TAiDecisionRepo["review"] = (id, input) =>
			Effect.tryPromise({
				try: async () => {
					await dbActive(db)
						.update(aiDecision)
						.set({ ...input, updatedAt: new Date() })
						.where(eq(aiDecision.id, id));
					const rows = await dbActive(db)
						.select(selection)
						.from(aiDecision)
						.leftJoin(user, eq(aiDecision.reviewedBy, user.id))
						.where(eq(aiDecision.id, id))
						.limit(1);
					return toDto(rows[0]!);
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		return AiDecisionRepo.of({ list, findById, create, review });
	}),
).pipe(Layer.provide(dbServiceLayer));
