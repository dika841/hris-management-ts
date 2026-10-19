import { EMPLOYEE_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import { FormPage } from "#/routes/_authenticated/_components/form-page.tsx";
import { EmployeeEditForm } from "#/routes/_authenticated/employees/_components/employee-create-form.tsx";
import {
	employeeGetOptions,
	useEmployeeGet,
} from "#/routes/_authenticated/employees/_hooks/use-employees.ts";

const EmployeeEditPage: FC = (): ReactElement => {
	const { employeeId } = Route.useParams();
	const { data: employee } = useEmployeeGet(employeeId);

	return (
		<FormPage
			parentLabel={EMPLOYEE_MESSAGE.TITLE}
			parentTo="/employees"
			backLabel="Kembali ke Daftar Karyawan"
			title="Perbarui Data Karyawan"
			description="Perbarui identitas, penempatan, skema pajak, rekening payroll, kepesertaan BPJS, dan persetujuan UU PDP."
		>
			<EmployeeEditForm employee={employee} />
		</FormPage>
	);
};

export const Route = createFileRoute(
	"/_authenticated/employees/$employeeId/edit",
)({
	beforeLoad: checkRoutePermissions({
		permissions: [PERMISSION.EMPLOYEE_MANAGE],
	}),
	loader: ({ context, params }) =>
		context.queryClient.ensureQueryData(employeeGetOptions(params.employeeId)),
	component: EmployeeEditPage,
});
