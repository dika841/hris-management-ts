import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import { PAYROLL_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { FormPage } from "#/routes/_authenticated/_components/form-page.tsx";
import { PayrollPeriodCreateForm } from "#/routes/_authenticated/payroll/_components/payroll-period-create-form.tsx";

const PayrollPeriodCreatePage: FC = (): ReactElement => {
	return (
		<FormPage
			parentLabel={PAYROLL_MESSAGE.TITLE}
			parentTo="/payroll"
			backLabel="Kembali ke Daftar Periode"
			title="Buka Siklus Penggajian Baru"
			description="Tetapkan rentang cut-off absensi, tanggal pencairan gaji, dan parameter pemotongan PPh 21 TER."
		>
			<PayrollPeriodCreateForm />
		</FormPage>
	);
};

export const Route = createFileRoute("/_authenticated/payroll/create")({
	beforeLoad: checkRoutePermissions({
		permissions: [PERMISSION.PAYROLL_MANAGE],
	}),
	component: PayrollPeriodCreatePage,
});
