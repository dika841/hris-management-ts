import { Badge } from "@app/components/ui/badge";
import type { TEmploymentStatus, TTaxMethod } from "@app/schemas";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import type { FC, ReactElement } from "react";
import { match } from "ts-pattern";

export const EmploymentStatusBadge: FC<{ status: TEmploymentStatus }> = ({
	status,
}): ReactElement => {
	return match(status)
		.with("permanent", () => (
			<Badge
				variant="outline"
				className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium text-[11px]"
			>
				Permanent
			</Badge>
		))
		.with("contract", () => (
			<Badge
				variant="outline"
				className="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium text-[11px]"
			>
				Contract
			</Badge>
		))
		.with("probation", () => (
			<Badge
				variant="outline"
				className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium text-[11px]"
			>
				Probation
			</Badge>
		))
		.with("intern", () => (
			<Badge
				variant="outline"
				className="border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium text-[11px]"
			>
				Intern
			</Badge>
		))
		.exhaustive();
};

export const TaxMethodBadge: FC<{ method: TTaxMethod }> = ({
	method,
}): ReactElement => {
	return match(method)
		.with("gross", () => (
			<Badge
				variant="outline"
				className="border-border/60 bg-muted/40 text-foreground font-mono text-[10px]"
			>
				GROSS
			</Badge>
		))
		.with("gross_up", () => (
			<Badge
				variant="outline"
				className="border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono text-[10px]"
			>
				GROSS-UP
			</Badge>
		))
		.with("nett", () => (
			<Badge
				variant="outline"
				className="border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-mono text-[10px]"
			>
				NETT
			</Badge>
		))
		.exhaustive();
};

export const PdpConsentBadge: FC<{ consent: boolean }> = ({
	consent,
}): ReactElement => {
	return consent ? (
		<span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
			<ShieldCheck className="size-3.5" />
			<span>UU PDP</span>
		</span>
	) : (
		<span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
			<ShieldAlert className="size-3.5" />
			<span>Pending</span>
		</span>
	);
};
