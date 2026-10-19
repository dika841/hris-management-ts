import { AI_GOVERNANCE_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import type { TAiDecisionStatus } from "@app/schemas";
import { Badge } from "@app/components/ui/badge";
import { Button } from "@app/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@app/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@app/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@app/components/ui/table";
import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import { useI18n } from "#/libs/i18n/index.ts";
import {
	useAiDecisionApprove,
	useAiDecisionList,
	useAiDecisionReject,
} from "#/routes/_authenticated/_hooks/use-ai-governance.ts";
import { createFileRoute } from "@tanstack/react-router";
import { Check, ShieldCheck, X } from "lucide-react";
import { useState, type FC, type ReactElement } from "react";

const statusLabel = (
	status: TAiDecisionStatus,
	isIndonesian: boolean,
): string => {
	if (status === "approved") {
		return isIndonesian ? "Disetujui" : "Approved";
	}
	if (status === "rejected") {
		return isIndonesian ? "Ditolak" : "Rejected";
	}
	return isIndonesian ? "Menunggu review" : "Pending review";
};

const statusVariant = (
	status: TAiDecisionStatus,
): "default" | "outline" | "destructive" =>
	status === "approved"
		? "default"
		: status === "rejected"
			? "destructive"
			: "outline";

const AiGovernancePage: FC = (): ReactElement => {
	const { isIndonesian } = useI18n();
	const [status, setStatus] = useState<"all" | TAiDecisionStatus>("all");
	const [page, setPage] = useState(1);

	const list = useAiDecisionList({
		page,
		pageSize: 20,
		...(status === "all" ? {} : { status }),
	});
	const approve = useAiDecisionApprove();
	const reject = useAiDecisionReject();
	const totalPages = Math.max(1, Math.ceil((list.data?.total ?? 0) / 20));

	const review = (id: string, action: "approved" | "rejected"): void => {
		const note = window.prompt(
			action === "rejected"
				? isIndonesian
					? "Catatan penolakan (wajib)"
					: "Rejection note (required)"
				: isIndonesian
					? "Catatan review (opsional)"
					: "Review note (optional)",
		);
		if (note === null) {
			return;
		}
		if (action === "rejected" && note.trim() === "") {
			return;
		}
		if (action === "approved") {
			approve.mutate({ id, note: note.trim() || undefined });
		} else {
			reject.mutate({ id, note });
		}
	};

	return (
		<div className="flex flex-col gap-6">
			<div>
				<h1 className="flex items-center gap-2 text-xl font-bold tracking-tight">
					<ShieldCheck className="size-5 text-primary" />
					{AI_GOVERNANCE_MESSAGE.TITLE}
				</h1>
				<p className="mt-1 text-xs text-muted-foreground">
					{isIndonesian
						? "Keputusan dari Asisten AI tercatat otomatis di sini. Tinjau sebelum dipakai untuk keputusan HR."
						: "Decisions from the AI Assistant are recorded here automatically. Review them before using them for HR decisions."}
				</p>
			</div>

			<Card className="overflow-hidden">
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle className="text-sm font-semibold">
						{isIndonesian ? "Keputusan AI" : "AI Decisions"}
					</CardTitle>
					<Select
						value={status}
						onValueChange={(value) => {
							setStatus(value as "all" | TAiDecisionStatus);
							setPage(1);
						}}
					>
						<SelectTrigger className="h-8 w-40 text-xs">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">
								{isIndonesian ? "Semua status" : "All statuses"}
							</SelectItem>
							<SelectItem value="pending_review">
								{isIndonesian ? "Menunggu review" : "Pending review"}
							</SelectItem>
							<SelectItem value="approved">
								{isIndonesian ? "Disetujui" : "Approved"}
							</SelectItem>
							<SelectItem value="rejected">
								{isIndonesian ? "Ditolak" : "Rejected"}
							</SelectItem>
						</SelectContent>
					</Select>
				</CardHeader>
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow className="bg-muted/30">
								<TableHead className="text-xs">
									{AI_GOVERNANCE_MESSAGE.FEATURE}
								</TableHead>
								<TableHead className="text-xs">
									{AI_GOVERNANCE_MESSAGE.MODEL}
								</TableHead>
								<TableHead className="text-right text-xs">
									{AI_GOVERNANCE_MESSAGE.CONFIDENCE}
								</TableHead>
								<TableHead className="text-xs">
									{AI_GOVERNANCE_MESSAGE.RISK}
								</TableHead>
								<TableHead className="text-xs">
									{AI_GOVERNANCE_MESSAGE.STATUS}
								</TableHead>
								<TableHead className="text-xs">
									{AI_GOVERNANCE_MESSAGE.DECISION}
								</TableHead>
								<TableHead className="text-right text-xs">
									{isIndonesian ? "Aksi" : "Actions"}
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{(list.data?.items ?? []).length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={7}
										className="py-8 text-center text-xs text-muted-foreground"
									>
										{isIndonesian
											? "Belum ada keputusan AI. Hasil dari Asisten AI akan muncul di sini."
											: "No AI decisions yet. AI Assistant results will appear here."}
									</TableCell>
								</TableRow>
							) : (
								list.data?.items.map((item) => (
									<TableRow key={item.id}>
										<TableCell className="align-top text-xs">
											<div className="font-medium">{item.feature}</div>
											<div className="text-[10px] text-muted-foreground">
												{item.subjectType ?? "-"}
												{item.subjectId === null ? "" : ` · ${item.subjectId}`}
											</div>
										</TableCell>
										<TableCell className="align-top text-xs">
											{item.model}
										</TableCell>
										<TableCell className="align-top text-right font-mono text-xs">
											{item.confidence}%
										</TableCell>
										<TableCell className="align-top">
											<Badge
												variant={
													item.riskLevel === "high" ? "destructive" : "outline"
												}
												className="text-[10px] uppercase"
											>
												{item.riskLevel}
											</Badge>
										</TableCell>
										<TableCell className="align-top">
											<Badge
												variant={statusVariant(item.status)}
												className="text-[10px]"
											>
												{statusLabel(item.status, isIndonesian)}
											</Badge>
											{item.redactionApplied && (
												<div className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-400">
													{AI_GOVERNANCE_MESSAGE.REDACTED}
												</div>
											)}
										</TableCell>
										<TableCell className="align-top text-xs">
											<details>
												<summary className="cursor-pointer text-[11px] text-primary">
													{isIndonesian ? "Lihat" : "View"}
												</summary>
												<pre className="mt-1 max-w-64 overflow-auto rounded bg-muted p-2 text-[10px]">
													{JSON.stringify(item.decision, null, 2)}
												</pre>
											</details>
											{item.reviewedByName !== null && (
												<div className="mt-1 text-[10px] text-muted-foreground">
													{AI_GOVERNANCE_MESSAGE.REVIEWER}:{" "}
													{item.reviewedByName}
												</div>
											)}
										</TableCell>
										<TableCell className="text-right align-top">
											{item.status === "pending_review" && (
												<div className="flex justify-end gap-1">
													<Button
														size="sm"
														variant="outline"
														onClick={() => review(item.id, "approved")}
													>
														<Check className="size-3.5 text-emerald-500" />
														{AI_GOVERNANCE_MESSAGE.APPROVE}
													</Button>
													<Button
														size="sm"
														variant="outline"
														onClick={() => review(item.id, "rejected")}
													>
														<X className="size-3.5 text-rose-500" />
														{AI_GOVERNANCE_MESSAGE.REJECT}
													</Button>
												</div>
											)}
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
				<div className="flex items-center justify-between border-t border-border/40 px-4 py-2 text-xs text-muted-foreground">
					<span>
						{isIndonesian ? "Total" : "Total"}: {list.data?.total ?? 0}
					</span>
					<div className="flex items-center gap-1">
						<Button
							size="sm"
							variant="outline"
							disabled={page <= 1}
							onClick={() => setPage((value) => value - 1)}
						>
							{isIndonesian ? "Sebelumnya" : "Previous"}
						</Button>
						<span className="px-2">
							{page} / {totalPages}
						</span>
						<Button
							size="sm"
							variant="outline"
							disabled={page >= totalPages}
							onClick={() => setPage((value) => value + 1)}
						>
							{isIndonesian ? "Berikutnya" : "Next"}
						</Button>
					</div>
				</div>
			</Card>
		</div>
	);
};

export const Route = createFileRoute("/_authenticated/ai-governance/")({
	beforeLoad: checkRoutePermissions({
		permissions: [PERMISSION.AI_GOVERNANCE_READ],
	}),
	component: AiGovernancePage,
});
