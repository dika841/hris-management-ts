import { Guard } from "@app/components/guard/guard";
import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import { PERMISSION } from "@app/permissions";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { useI18n } from "#/libs/i18n/index.ts";
import { RoleCreateForm } from "#/routes/_authenticated/roles/_components/role-create-form.tsx";
import { RoleList } from "#/routes/_authenticated/roles/_components/role-list.tsx";
import {
	roleListOptions,
	useRoleList,
} from "#/routes/_authenticated/roles/_hooks/use-roles.ts";

const RolesPage: FC = (): ReactElement => {
	const { data } = useRoleList();
	const { t } = useI18n();

	return (
		<div className="flex flex-col gap-6">
			<h1 className="text-xl font-semibold">{t("role.title")}</h1>
			<Guard permissions={[PERMISSION.USER_MANAGE]}>
				<RoleCreateForm />
			</Guard>
			<RoleList roles={data.items} />
		</div>
	);
};

export const Route = createFileRoute("/_authenticated/roles/")({
	beforeLoad: checkRoutePermissions({ permissions: [PERMISSION.USER_MANAGE] }),
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(roleListOptions()),
	component: RolesPage,
});
