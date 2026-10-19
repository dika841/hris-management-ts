import { Skeleton } from "@app/components/ui/skeleton";
import { APP_MESSAGE } from "@app/messages";
import { A } from "@mobily/ts-belt";
import type { FC, ReactElement } from "react";
import { LoginLayout } from "#/routes/_public/login/_components/login-layout.tsx";

const PENDING_FIELDS = [
	{ id: "email", labelWidth: "w-12" },
	{ id: "password", labelWidth: "w-20" },
] as const;

export const LoginPendingScreen: FC = (): ReactElement => (
	<LoginLayout>
		<output aria-label={APP_MESSAGE.LOADING} className="flex flex-col gap-6">
			<div className="flex flex-col items-center gap-2">
				<Skeleton className="h-8 w-64" />
				<div className="flex w-full flex-col items-center gap-1.5">
					<Skeleton className="h-4 w-11/12" />
					<Skeleton className="h-4 w-2/3" />
				</div>
			</div>
			<div className="grid gap-6">
				{A.map(PENDING_FIELDS, (field) => (
					<div key={field.id} className="grid gap-1.5">
						<Skeleton className={`h-3.5 ${field.labelWidth}`} />
						<Skeleton className="h-9 w-full" />
					</div>
				))}
				<Skeleton className="h-9 w-full" />
			</div>
		</output>
	</LoginLayout>
);
