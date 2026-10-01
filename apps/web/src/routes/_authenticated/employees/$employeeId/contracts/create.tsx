import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import { PERMISSION } from "@app/permissions";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { FormPage } from "#/routes/_authenticated/_components/form-page.tsx";
import { ContractCreateForm } from "../../_components/contract-create-form.tsx";
import {
	employeeGetOptions,
	useEmployeeGet,
} from "../../_hooks/use-employees.ts";

const ContractCreatePage: FC = (): ReactElement => {
	const { employeeId } = Route.useParams();
	const { data: employee } = useEmployeeGet(employeeId);

	return (
		<FormPage
			parentLabel={`Karyawan: ${employee.fullName}`}
			parentTo="/employees"
			backLabel="Kembali ke Detail Karyawan"
			title="Terbitkan Kontrak Kerja Baru"
			description="Penerbitan perjanjian kerja PKWT, PKWTT, maupun magang dengan kalkulasi estimasi hak kompensasi PP 35/2021 secara otomatis."
		>
			<ContractCreateForm employee={employee} />
		</FormPage>
	);
};

export const Route = createFileRoute(
	"/_authenticated/employees/$employeeId/contracts/create",
)({
	beforeLoad: checkRoutePermissions({
		permissions: [PERMISSION.EMPLOYEE_MANAGE],
	}),
	loader: ({ context, params }) =>
		context.queryClient.ensureQueryData(employeeGetOptions(params.employeeId)),
	component: ContractCreatePage,
});
