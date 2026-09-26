import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import { EMPLOYEE_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { FormPage } from "#/routes/_authenticated/_components/form-page.tsx";
import { EmployeeCreateForm } from "#/routes/_authenticated/employees/_components/employee-create-form.tsx";

const EmployeeCreatePage: FC = (): ReactElement => {
	return (
		<FormPage
			parentLabel={EMPLOYEE_MESSAGE.TITLE}
			parentTo="/employees"
			backLabel="Kembali ke Daftar Karyawan"
			title="Registrasi Karyawan Baru"
			description="Lengkapi profil identitas tenaga kerja, penempatan jabatan, skema pemotongan PPh 21 TER, dan kepatuhan UU PDP."
		>
			<EmployeeCreateForm />
		</FormPage>
	);
};

export const Route = createFileRoute("/_authenticated/employees/create")({
	beforeLoad: checkRoutePermissions({
		permissions: [PERMISSION.EMPLOYEE_MANAGE],
	}),
	component: EmployeeCreatePage,
});
