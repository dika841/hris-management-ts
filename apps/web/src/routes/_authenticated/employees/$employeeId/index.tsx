import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import { PERMISSION } from "@app/permissions";
import { createFileRoute } from "@tanstack/react-router";
import { FileText, User } from "lucide-react";
import { type FC, type ReactElement, useState } from "react";
import { EmployeeContractsTab } from "../_components/employee-contracts-tab.tsx";
import { EmployeeDetailHeader } from "../_components/employee-detail-header.tsx";
import { EmployeeProfileTab } from "../_components/employee-profile-tab.tsx";
import {
	contractListOptions,
	employeeGetOptions,
	useEmployeeGet,
} from "../_hooks/use-employees.ts";

const EmployeeDetailPage: FC = (): ReactElement => {
	const { employeeId } = Route.useParams();
	const { data: employee } = useEmployeeGet(employeeId);
	const [activeTab, setActiveTab] = useState<"profile" | "contracts">("profile");

	return (
		<div className="space-y-6">
			<EmployeeDetailHeader employee={employee} />

			{/* Tab Switcher */}
			<div className="flex border-b border-border/60 gap-4">
				<button
					type="button"
					onClick={() => setActiveTab("profile")}
					className={`flex items-center gap-2 border-b-2 py-2.5 text-xs font-semibold transition-colors ${
						activeTab === "profile"
							? "border-primary text-primary"
							: "border-transparent text-muted-foreground hover:text-foreground"
					}`}
				>
					<User className="size-3.5" />
					Profil & Penempatan
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("contracts")}
					className={`flex items-center gap-2 border-b-2 py-2.5 text-xs font-semibold transition-colors ${
						activeTab === "contracts"
							? "border-primary text-primary"
							: "border-transparent text-muted-foreground hover:text-foreground"
					}`}
				>
					<FileText className="size-3.5" />
					Perjanjian Kerja (PKWT/PKWTT)
				</button>
			</div>

			{activeTab === "profile" && <EmployeeProfileTab employee={employee} />}
			{activeTab === "contracts" && <EmployeeContractsTab employeeId={employee.id} />}
		</div>
	);
};

export const Route = createFileRoute("/_authenticated/employees/$employeeId/")({
	beforeLoad: checkRoutePermissions({
		permissions: [PERMISSION.EMPLOYEE_READ],
	}),
	loader: ({ context, params }) =>
		Promise.all([
			context.queryClient.ensureQueryData(employeeGetOptions(params.employeeId)),
			context.queryClient.ensureQueryData(contractListOptions(params.employeeId)),
		]),
	component: EmployeeDetailPage,
});
