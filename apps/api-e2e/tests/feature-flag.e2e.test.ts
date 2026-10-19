import type { TFeatureFlag, TFeatureFlagEvaluation } from "@app/schemas";
import { beforeAll, describe, expect, it } from "vitest";
import { apiFetch, apiJson } from "../support/api-fetch.ts";
import { SEED_CREDENTIALS, signIn } from "../support/sign-in.ts";

let adminCookie = "";

beforeAll(async (): Promise<void> => {
	adminCookie = await signIn(SEED_CREDENTIALS.admin);
});

describe("feature flags", () => {
	it("creates, evaluates, updates, and deletes a flag", async (): Promise<void> => {
		const created = await apiJson<TFeatureFlag>({
			path: "/feature-flags",
			cookie: adminCookie,
			method: "POST",
			body: {
				key: "e2e_feature",
				name: "E2E Feature",
				description: "Feature flag API E2E",
				enabled: true,
				rolloutPercentage: 100,
			},
		});
		expect(created.key).toBe("e2e_feature");

		const evaluation = await apiJson<TFeatureFlagEvaluation>({
			path: "/feature-flags/evaluate",
			cookie: adminCookie,
		});
		expect(evaluation.find((item) => item.key === "e2e_feature")?.enabled).toBe(
			true,
		);

		const updated = await apiJson<TFeatureFlag>({
			path: `/feature-flags/${created.id}`,
			cookie: adminCookie,
			method: "PATCH",
			body: { rolloutPercentage: 0 },
		});
		expect(updated.rolloutPercentage).toBe(0);

		const afterUpdate = await apiJson<TFeatureFlagEvaluation>({
			path: "/feature-flags/evaluate",
			cookie: adminCookie,
		});
		expect(
			afterUpdate.find((item) => item.key === "e2e_feature")?.enabled,
		).toBe(false);

		const duplicate = await apiFetch({
			path: "/feature-flags",
			cookie: adminCookie,
			method: "POST",
			body: {
				key: "e2e_feature",
				name: "Duplicate",
				enabled: false,
				rolloutPercentage: 0,
			},
		});
		expect(duplicate.status).toBe(409);

		const removal = await apiFetch({
			path: `/feature-flags/${created.id}`,
			cookie: adminCookie,
			method: "DELETE",
		});
		expect(removal.status).toBe(200);
	});

	it("hides flag administration from non-admin users", async (): Promise<void> => {
		const memberCookie = await signIn(SEED_CREDENTIALS.member);
		const response = await apiFetch({
			path: "/feature-flags",
			cookie: memberCookie,
		});
		expect(response.status).toBe(403);

		const evaluation = await apiJson<TFeatureFlagEvaluation>({
			path: "/feature-flags/evaluate",
			cookie: memberCookie,
		});
		expect(Array.isArray(evaluation)).toBe(true);
	});
});
