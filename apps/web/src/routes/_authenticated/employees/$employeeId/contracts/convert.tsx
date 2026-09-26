import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import { PERMISSION } from "@app/permissions";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { FormPage } from "#/routes/_authenticated/_components/form-page.tsx";
import { ContractConvertForm } from "../../_components/contract-convert-form.tsx";
import {
	contractListOptions,
	employeeGetOptions,
	useEmployeeGet,
} from "../../_hooks/use-employees.ts";

const ContractConvertPage: FC = (): ReactElement => {
	const { employeeId } = Route.useParams();
	const { data: employee } = useEmployeeGet(employeeId);

	return (
		<FormPage
			parentLabel={`Karyawan: ${employee.fullName}`}
			parentTo="/employees"
			backLabel="Kembali ke Detail Karyawan"
			title="Pengangkatan Karyawan Tetap (PKWTT)"
			description="Konversi status kerja kontrak (PKWT) menjadi karyawan tetap (PKWTT), mencatat SK Pengangkatan, dan menyelesaikan hak kompensasi masa kontrak berakhir."
		>
			<ContractConvertForm employee={employee} />
		</FormPage>
	);
};

export const Route = createFileRoute(
	"/_authenticated/employees/$employeeId/contracts/convert",
)({
	beforeLoad: checkRoutePermissions({
		permissions: [PERMISSION.EMPLOYEE_MANAGE],
	}),
	loader: ({ context, params }) =>
		Promise.all([
			context.queryClient.ensureQueryData(employeeGetOptions(params.employeeId)),
			context.queryClient.ensureQueryData(contractListOptions(params.employeeId)),
		]),
	component: ContractConvertPage,
});
