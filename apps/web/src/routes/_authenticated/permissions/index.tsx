import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import { PERMISSION } from "@app/permissions";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { useI18n } from "#/libs/i18n/index.ts";
import { PermissionMatrix } from "#/routes/_authenticated/permissions/_components/permission-matrix.tsx";
import { roleListOptions } from "#/routes/_authenticated/roles/_hooks/use-roles.ts";

const PermissionsPage: FC = (): ReactElement => {
	const { t } = useI18n();

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="text-xl font-semibold">{t("permission.title")}</h1>
				<p className="text-sm text-muted-foreground">
					{t("permission.subtitle")}
				</p>
			</div>
			<PermissionMatrix />
		</div>
	);
};

export const Route = createFileRoute("/_authenticated/permissions/")({
	beforeLoad: checkRoutePermissions({ permissions: [PERMISSION.USER_MANAGE] }),
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(roleListOptions()),
	component: PermissionsPage,
});
