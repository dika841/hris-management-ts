import { ATTENDANCE_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import { FormPage } from "#/routes/_authenticated/_components/form-page.tsx";
import { LeaveRequestCreateForm } from "#/routes/_authenticated/attendance/_components/leave-request-create-form.tsx";

const LeaveRequestCreatePage: FC = (): ReactElement => {
	return (
		<FormPage
			parentLabel={ATTENDANCE_MESSAGE.TITLE}
			parentTo="/attendance"
			backLabel="Kembali ke Kehadiran"
			title="Formulir Pengajuan Cuti &amp; Izin"
			description="Pengajuan cuti tahunan, cuti melahirkan UU KIA 2024, cuti haid, sakit berkepanjangan, atau izin resmi berbayar/unpaid."
		>
			<LeaveRequestCreateForm />
		</FormPage>
	);
};

export const Route = createFileRoute("/_authenticated/attendance/leave/create")(
	{
		beforeLoad: checkRoutePermissions({
			permissions: [PERMISSION.LEAVE_MANAGE],
		}),
		component: LeaveRequestCreatePage,
	},
);
