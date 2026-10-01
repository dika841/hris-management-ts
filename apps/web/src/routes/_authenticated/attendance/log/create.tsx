import { ATTENDANCE_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import { FormPage } from "#/routes/_authenticated/_components/form-page.tsx";
import { AttendanceLogForm } from "#/routes/_authenticated/attendance/_components/attendance-log-form.tsx";

const AttendanceLogCreatePage: FC = (): ReactElement => {
	return (
		<FormPage
			parentLabel={ATTENDANCE_MESSAGE.TITLE}
			parentTo="/attendance"
			backLabel="Kembali ke Kehadiran"
			title="Catat Presensi Karyawan"
			description="Input data kehadiran harian karyawan, jam clock-in/out, keterlambatan, atau status absensi dinas luar/remote."
		>
			<AttendanceLogForm />
		</FormPage>
	);
};

export const Route = createFileRoute("/_authenticated/attendance/log/create")({
	beforeLoad: checkRoutePermissions({
		permissions: [PERMISSION.ATTENDANCE_MANAGE],
	}),
	component: AttendanceLogCreatePage,
});
