import { ATTENDANCE_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import { FormPage } from "#/routes/_authenticated/_components/form-page.tsx";
import { OvertimeCreateForm } from "#/routes/_authenticated/attendance/_components/overtime-create-form.tsx";

const OvertimeCreatePage: FC = (): ReactElement => {
	return (
		<FormPage
			parentLabel={ATTENDANCE_MESSAGE.TITLE}
			parentTo="/attendance"
			backLabel="Kembali ke Kehadiran"
			title="Penerbitan Surat Perintah Lembur (SPL)"
			description="Formulir penugasan kerja lembur dengan kalkulator kepatuhan batas 4 jam/hari dan 18 jam/minggu sesuai PP 35/2021."
		>
			<OvertimeCreateForm />
		</FormPage>
	);
};

export const Route = createFileRoute(
	"/_authenticated/attendance/overtime/create",
)({
	beforeLoad: checkRoutePermissions({
		permissions: [PERMISSION.OVERTIME_MANAGE],
	}),
	component: OvertimeCreatePage,
});
