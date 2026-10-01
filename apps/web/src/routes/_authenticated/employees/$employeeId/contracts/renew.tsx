import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import { PERMISSION } from "@app/permissions";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { FormPage } from "#/routes/_authenticated/_components/form-page.tsx";
import { ContractRenewForm } from "../../_components/contract-renew-form.tsx";
import {
	contractListOptions,
	employeeGetOptions,
	useEmployeeGet,
} from "../../_hooks/use-employees.ts";

const ContractRenewPage: FC = (): ReactElement => {
	const { employeeId } = Route.useParams();
	const { data: employee } = useEmployeeGet(employeeId);

	return (
		<FormPage
			parentLabel={`Karyawan: ${employee.fullName}`}
			parentTo="/employees"
			backLabel="Kembali ke Detail Karyawan"
			title="Perpanjangan Perjanjian Kerja (PKWT)"
			description="Perpanjang kontrak PKWT dengan perhitungan hak kompensasi periode sebelumnya yang wajib dibayarkan serta validasi batas maksimal 5 tahun akumulasi (PP 35/2021)."
		>
			<ContractRenewForm employee={employee} />
		</FormPage>
	);
};

export const Route = createFileRoute(
	"/_authenticated/employees/$employeeId/contracts/renew",
)({
	beforeLoad: checkRoutePermissions({
		permissions: [PERMISSION.EMPLOYEE_MANAGE],
	}),
	loader: ({ context, params }) =>
		Promise.all([
			context.queryClient.ensureQueryData(
				employeeGetOptions(params.employeeId),
			),
			context.queryClient.ensureQueryData(
				contractListOptions(params.employeeId),
			),
		]),
	component: ContractRenewPage,
});
