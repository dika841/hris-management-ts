import { PERMISSION, ROLE } from "@app/permissions";
import type {
	TMe,
	TRoleCreateInput,
	TRoleDto,
	TRoleList,
	TUser,
	TUserCreateInput,
} from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { beforeAll, describe, expect, it } from "vitest";
import { apiFetch, apiJson } from "../support/api-fetch.ts";
import { SEED_CREDENTIALS, signIn } from "../support/sign-in.ts";

const ROLE_KEY = "e2e-reviewer";

const NEW_ROLE: TRoleCreateInput = {
	key: ROLE_KEY,
	label: "Reviewer",
	description: "Reads notes, nothing else.",
	permissions: [PERMISSION.NOTE_READ],
};

const REVIEWER: TUserCreateInput = {
	name: "E2E Reviewer",
	email: "e2e-reviewer@test.app",
	password: "rePassword123",
	role: ROLE_KEY,
};

let adminCookie = "";

beforeAll(async (): Promise<void> => {
	adminCookie = await signIn(SEED_CREDENTIALS.admin);
});

describe("roles REST endpoints", () => {
	it("lists the fixed roles", async (): Promise<void> => {
		const list = await apiJson<TRoleList>({
			path: "/roles",
			cookie: adminCookie,
		});
		const fixedKeys = A.map(
			A.filter(list.items, (role) => role.fixed),
			(role) => role.key,
		);
		expect(fixedKeys).toEqual(
			expect.arrayContaining([ROLE.ADMIN, ROLE.MEMBER, ROLE.VIEWER]),
		);
	});

	it("refuses to modify or delete a fixed role", async (): Promise<void> => {
		const update = await apiFetch({
			path: `/roles/${ROLE.ADMIN}`,
			cookie: adminCookie,
			method: "PATCH",
			body: { permissions: [] },
		});
		expect(update.status).toBe(400);

		const remove = await apiFetch({
			path: `/roles/${ROLE.VIEWER}`,
			cookie: adminCookie,
			method: "DELETE",
		});
		expect(remove.status).toBe(400);
	});

	it("creates a custom role, resolves it for an assigned user, updates it live, then deletes it", async (): Promise<void> => {
		const createResponse = await apiFetch({
			path: "/roles",
			cookie: adminCookie,
			method: "POST",
			body: NEW_ROLE,
		});
		expect(createResponse.status).toBe(200);
		const role = (await createResponse.json()) as TRoleDto;
		expect(role.fixed).toBe(false);
		expect(role.permissions).toEqual([PERMISSION.NOTE_READ]);

		const duplicate = await apiFetch({
			path: "/roles",
			cookie: adminCookie,
			method: "POST",
			body: NEW_ROLE,
		});
		expect(duplicate.status).toBe(409);

		const reviewer = await apiJson<TUser>({
			path: "/users",
			cookie: adminCookie,
			method: "POST",
			body: REVIEWER,
		});
		expect(reviewer.role).toBe(ROLE_KEY);

		const reviewerCookie = await signIn({
			email: REVIEWER.email,
			password: REVIEWER.password,
		});
		const me = await apiJson<TMe>({ path: "/me", cookie: reviewerCookie });
		expect(me.permissions).toEqual([PERMISSION.NOTE_READ]);

		const readNotes = await apiFetch({
			path: "/notes?page=1&pageSize=5",
			cookie: reviewerCookie,
		});
		expect(readNotes.status).toBe(200);

		const writeNote = await apiFetch({
			path: "/notes",
			cookie: reviewerCookie,
			method: "POST",
			body: { title: "nope", body: "" },
		});
		expect(writeNote.status).toBe(403);

		const deleteInUse = await apiFetch({
			path: `/roles/${ROLE_KEY}`,
			cookie: adminCookie,
			method: "DELETE",
		});
		expect(deleteInUse.status).toBe(409);

		const update = await apiFetch({
			path: `/roles/${ROLE_KEY}`,
			cookie: adminCookie,
			method: "PATCH",
			body: { permissions: [PERMISSION.NOTE_READ, PERMISSION.NOTE_WRITE] },
		});
		expect(update.status).toBe(200);

		const meAfter = await apiJson<TMe>({ path: "/me", cookie: reviewerCookie });
		expect(meAfter.permissions).toEqual(
			expect.arrayContaining([PERMISSION.NOTE_WRITE]),
		);

		const deleteUser = await apiFetch({
			path: `/users/${reviewer.id}`,
			cookie: adminCookie,
			method: "DELETE",
		});
		expect(deleteUser.status).toBe(200);

		const deleteRole = await apiFetch({
			path: `/roles/${ROLE_KEY}`,
			cookie: adminCookie,
			method: "DELETE",
		});
		expect(deleteRole.status).toBe(200);
	});
});
