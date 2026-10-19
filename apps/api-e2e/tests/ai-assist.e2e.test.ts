import type {
	TAiAssistOutput,
	TAiDecisionList,
	TFeatureFlag,
} from "@app/schemas";
import { beforeAll, describe, expect, it } from "vitest";
import { apiFetch, apiJson } from "../support/api-fetch.ts";
import { SEED_CREDENTIALS, signIn } from "../support/sign-in.ts";

let adminCookie = "";

beforeAll(async (): Promise<void> => {
	adminCookie = await signIn(SEED_CREDENTIALS.admin);
});

describe("AI assist", () => {
	it("requires the ai_assistant flag and records the governance decision", async (): Promise<void> => {
		const disabled = await apiFetch({
			path: "/ai/assist",
			cookie: adminCookie,
			method: "POST",
			body: {
				feature: "e2e_ai_assist",
				message: "Summarize attendance.",
			},
		});
		expect(disabled.status).toBe(403);

		const flag = await apiJson<TFeatureFlag>({
			path: "/feature-flags",
			cookie: adminCookie,
			method: "POST",
			body: {
				key: "ai_assistant",
				name: "AI Assistant",
				enabled: true,
				rolloutPercentage: 100,
			},
		});

		const assisted = await apiJson<TAiAssistOutput>({
			path: "/ai/assist",
			cookie: adminCookie,
			method: "POST",
			body: {
				feature: "e2e_ai_assist",
				message:
					"Summarize attendance for budi@example.com and call 081234567890.",
				context: { period: "2026-10", lateCount: 4 },
				subjectType: "employee",
				subjectId: "budi@example.com",
			},
		});

		expect(assisted.model).toBe("deepseek-chat");
		expect(assisted.summary).toBe("Mock summary from DeepSeek.");
		expect(assisted.riskLevel).toBe("medium");
		expect(assisted.confidence).toBe(82);
		expect(assisted.status).toBe("pending_review");
		expect(assisted.redactionApplied).toBe(true);

		const decisions = await apiJson<TAiDecisionList>({
			path: "/ai/decisions?page=1&pageSize=20&feature=e2e_ai_assist",
			cookie: adminCookie,
		});
		expect(decisions.total).toBe(1);
		expect(decisions.items[0]?.promptHash.startsWith("sha256:")).toBe(true);
		expect(decisions.items[0]?.id).toBe(assisted.decisionId);
		const serialized = JSON.stringify(decisions);
		expect(serialized).not.toContain("budi@example.com");
		expect(serialized).not.toContain("081234567890");
		expect(serialized).not.toContain("lateCount");

		await apiFetch({
			path: `/feature-flags/${flag.id}`,
			cookie: adminCookie,
			method: "DELETE",
		});

		const disabledAgain = await apiFetch({
			path: "/ai/assist",
			cookie: adminCookie,
			method: "POST",
			body: {
				feature: "e2e_ai_assist",
				message: "Summarize attendance.",
			},
		});
		expect(disabledAgain.status).toBe(403);
	});

	it("hides AI assistance from non-admin users", async (): Promise<void> => {
		const memberCookie = await signIn(SEED_CREDENTIALS.member);
		const response = await apiFetch({
			path: "/ai/assist",
			cookie: memberCookie,
			method: "POST",
			body: { feature: "forbidden", message: "Hello" },
		});
		expect(response.status).toBe(403);
	});
});
