import { ATTENDANCE_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import { FormPage } from "#/routes/_authenticated/_components/form-page.tsx";
import { HolidayCreateForm } from "#/routes/_authenticated/attendance/_components/holiday-create-form.tsx";

const HolidayCreatePage: FC = (): ReactElement => {
	return (
		<FormPage
			parentLabel={ATTENDANCE_MESSAGE.TITLE}
			parentTo="/attendance"
			backLabel="Kembali ke Kehadiran"
			title="Pendaftaran Hari Libur / Cuti Bersama"
			description="Tambahkan jadwal hari libur nasional atau cuti bersama pemerintah ke dalam kalender operasional perusahaan."
		>
			<HolidayCreateForm />
		</FormPage>
	);
};

export const Route = createFileRoute(
	"/_authenticated/attendance/holiday/create",
)({
	beforeLoad: checkRoutePermissions({
		permissions: [PERMISSION.ATTENDANCE_MANAGE],
	}),
	component: HolidayCreatePage,
});
