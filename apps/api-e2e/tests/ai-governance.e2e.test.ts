import type { TAiDecision, TAiDecisionList } from "@app/schemas";
import { beforeAll, describe, expect, it } from "vitest";
import { apiFetch, apiJson } from "../support/api-fetch.ts";
import { SEED_CREDENTIALS, signIn } from "../support/sign-in.ts";

let adminCookie = "";

beforeAll(async (): Promise<void> => {
	adminCookie = await signIn(SEED_CREDENTIALS.admin);
});

describe("AI governance", () => {
	it("redacts PII, requires review, and records the reviewer", async (): Promise<void> => {
		const created = await apiJson<TAiDecision>({
			path: "/ai/decisions",
			cookie: adminCookie,
			method: "POST",
			body: {
				feature: "e2e_ai_review",
				subjectType: "employee",
				subjectId: "emp-001",
				promptHash: "sha256:e2e-decision-hash-001",
				model: "deepseek-chat",
				decision: {
					email: "budi@example.com",
					note: "Call 081234567890 before payroll.",
					recommendation: "review",
				},
				confidence: 72,
				riskLevel: "medium",
				redactionApplied: true,
			},
		});

		expect(created.status).toBe("pending_review");
		expect(created.redactionApplied).toBe(true);
		const decision = created.decision as Record<string, unknown>;
		expect(decision.email).toBe("[REDACTED]");
		expect(decision.note).toBe("Call [REDACTED] before payroll.");
		expect(decision.recommendation).toBe("review");

		const list = await apiJson<TAiDecisionList>({
			path: "/ai/decisions?page=1&pageSize=20&status=pending_review&feature=e2e_ai_review",
			cookie: adminCookie,
		});
		expect(list.total).toBe(1);
		expect(list.items[0]?.id).toBe(created.id);

		const approved = await apiJson<TAiDecision>({
			path: `/ai/decisions/${created.id}/approve`,
			cookie: adminCookie,
			method: "POST",
			body: { id: created.id, note: "Looks correct." },
		});
		expect(approved.status).toBe("approved");
		expect(approved.reviewedBy).not.toBeNull();
		expect(approved.reviewedByName).not.toBeNull();

		const duplicate = await apiFetch({
			path: `/ai/decisions/${created.id}/approve`,
			cookie: adminCookie,
			method: "POST",
			body: { id: created.id },
		});
		expect(duplicate.status).toBe(409);
	});

	it("requires a note to reject and auto-approves only low-risk high-confidence decisions", async (): Promise<void> => {
		const highRisk = await apiJson<TAiDecision>({
			path: "/ai/decisions",
			cookie: adminCookie,
			method: "POST",
			body: {
				feature: "e2e_ai_reject",
				promptHash: "sha256:e2e-decision-hash-002",
				model: "deepseek-chat",
				decision: { recommendation: "reject" },
				confidence: 60,
				riskLevel: "high",
			},
		});
		expect(highRisk.status).toBe("pending_review");

		const missingNote = await apiFetch({
			path: `/ai/decisions/${highRisk.id}/reject`,
			cookie: adminCookie,
			method: "POST",
			body: { id: highRisk.id },
		});
		expect(missingNote.status).toBe(400);

		const rejected = await apiJson<TAiDecision>({
			path: `/ai/decisions/${highRisk.id}/reject`,
			cookie: adminCookie,
			method: "POST",
			body: { id: highRisk.id, note: "Insufficient evidence." },
		});
		expect(rejected.status).toBe("rejected");

		const autoApproved = await apiJson<TAiDecision>({
			path: "/ai/decisions",
			cookie: adminCookie,
			method: "POST",
			body: {
				feature: "e2e_ai_auto",
				promptHash: "sha256:e2e-decision-hash-003",
				model: "deepseek-chat",
				decision: { recommendation: "approve" },
				confidence: 95,
				riskLevel: "low",
				autoApprove: true,
			},
		});
		expect(autoApproved.status).toBe("approved");
		expect(autoApproved.reviewedAt).not.toBeNull();
	});

	it("hides the review queue from non-admin users", async (): Promise<void> => {
		const memberCookie = await signIn(SEED_CREDENTIALS.member);
		const list = await apiFetch({
			path: "/ai/decisions?page=1&pageSize=20",
			cookie: memberCookie,
		});
		expect(list.status).toBe(403);

		const create = await apiFetch({
			path: "/ai/decisions",
			cookie: memberCookie,
			method: "POST",
			body: {
				feature: "forbidden",
				promptHash: "sha256:forbidden-hash-0001",
				model: "deepseek-chat",
				decision: {},
				confidence: 10,
				riskLevel: "low",
			},
		});
		expect(create.status).toBe(403);
	});
});
