import { AI_GOVERNANCE_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import type { TAiDecisionStatus } from "@app/schemas";
import { Badge } from "@app/components/ui/badge";
import { Button } from "@app/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@app/components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@app/components/ui/collapsible";
import { Label } from "@app/components/ui/label";
import { Textarea } from "@app/components/ui/textarea";
import { cn } from "@app/components/lib/utils";
import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import { useI18n } from "#/libs/i18n/index.ts";
import { useAiAssist } from "#/routes/_authenticated/_hooks/use-ai-assist.ts";
import {
	useAiDecisionApprove,
	useAiDecisionReject,
} from "#/routes/_authenticated/_hooks/use-ai-governance.ts";
import { useFeatureFlagDisabled } from "#/routes/_authenticated/_hooks/use-feature-flags.ts";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Bot,
	CalendarCheck,
	Check,
	ChevronDown,
	Lightbulb,
	type LucideIcon,
	MessageCircle,
	RotateCcw,
	Send,
	ShieldCheck,
	Sparkles,
	Wallet,
	X,
} from "lucide-react";
import { useEffect, useRef, useState, type FC, type ReactElement } from "react";

type TQuickAction = {
	id: string;
	feature: string;
	icon: LucideIcon;
	labelId: string;
	labelEn: string;
	hintId: string;
	hintEn: string;
	promptId: string;
	promptEn: string;
};

const QUICK_ACTIONS: readonly TQuickAction[] = [
	{
		id: "attendance",
		feature: "attendance_analysis",
		icon: CalendarCheck,
		labelId: "Ringkas kehadiran",
		labelEn: "Summarize attendance",
		hintId: "Tren kehadiran & keterlambatan",
		hintEn: "Attendance & lateness trends",
		promptId:
			"Ringkas tren kehadiran dan keterlambatan bulan ini, lalu sarankan tindakan yang perlu diambil.",
		promptEn:
			"Summarize this month's attendance and lateness trends, then suggest actions to take.",
	},
	{
		id: "payroll",
		feature: "payroll_analysis",
		icon: Wallet,
		labelId: "Analisis payroll",
		labelEn: "Analyze payroll",
		hintId: "Temukan anomali & penyebabnya",
		hintEn: "Spot anomalies & their causes",
		promptId:
			"Jelaskan anomali payroll pada periode ini dan sarankan langkah perbaikannya.",
		promptEn: "Explain payroll anomalies in this period and suggest fixes.",
	},
	{
		id: "hr",
		feature: "hr_recommendation",
		icon: Lightbulb,
		labelId: "Rekomendasi HR",
		labelEn: "HR recommendation",
		hintId: "Saran tindakan berbasis data",
		hintEn: "Data-driven next steps",
		promptId:
			"Berikan rekomendasi HR berdasarkan data pendukung yang saya lampirkan.",
		promptEn: "Give HR recommendations based on the supporting data I provide.",
	},
	{
		id: "free",
		feature: "hr_assistant",
		icon: MessageCircle,
		labelId: "Tanya bebas",
		labelEn: "Ask anything",
		hintId: "Tulis pertanyaanmu sendiri",
		hintEn: "Write your own question",
		promptId: "",
		promptEn: "",
	},
];

const AiAssistantPage: FC = (): ReactElement => {
	const { isIndonesian } = useI18n();
	const disabled = useFeatureFlagDisabled("ai_assistant");
	const assist = useAiAssist();
	const approve = useAiDecisionApprove();
	const reject = useAiDecisionReject();
	const messageRef = useRef<HTMLTextAreaElement>(null);

	const [feature, setFeature] = useState("hr_assistant");
	const [message, setMessage] = useState("");
	const [context, setContext] = useState("");
	const [selectedAction, setSelectedAction] = useState<string | null>(null);
	const [contextOpen, setContextOpen] = useState(false);
	const [reviewStatus, setReviewStatus] = useState<TAiDecisionStatus | null>(
		null,
	);

	const result = assist.data;

	useEffect(() => {
		setReviewStatus(null);
	}, [result?.decisionId]);

	const review = (action: "approved" | "rejected"): void => {
		if (result === undefined) {
			return;
		}
		if (action === "approved") {
			approve.mutate(
				{ id: result.decisionId },
				{
					onSuccess: (decision) => setReviewStatus(decision.status),
				},
			);
			return;
		}
		const note = window.prompt(
			isIndonesian ? "Catatan penolakan (wajib)" : "Rejection note (required)",
		);
		if (note === null || note.trim() === "") {
			return;
		}
		reject.mutate(
			{ id: result.decisionId, note: note.trim() },
			{
				onSuccess: (decision) => setReviewStatus(decision.status),
			},
		);
	};

	const selectAction = (action: TQuickAction): void => {
		setFeature(action.feature);
		setMessage(isIndonesian ? action.promptId : action.promptEn);
		setSelectedAction(action.id);
		messageRef.current?.focus();
	};

	const submit = (): void => {
		const trimmedMessage = message.trim();
		if (trimmedMessage === "") {
			return;
		}
		const trimmedContext = context.trim();
		assist.mutate({
			feature,
			message: trimmedMessage,
			...(trimmedContext === "" ? {} : { context: { notes: trimmedContext } }),
		});
	};

	const displayStatus =
		result === undefined ? null : (reviewStatus ?? result.status);
	const reviewing = approve.isPending || reject.isPending;

	return (
		<div className="flex flex-col gap-6">
			<div>
				<h1 className="flex items-center gap-2 text-xl font-bold tracking-tight">
					<Sparkles className="size-5 text-primary" />
					{isIndonesian ? "Asisten AI" : "AI Assistant"}
				</h1>
				<p className="mt-1 text-xs text-muted-foreground">
					{isIndonesian
						? "Tulis pertanyaan seperti mengobrol. Tidak perlu mengisi konfigurasi teknis."
						: "Ask in plain language. No technical setup required."}
				</p>
			</div>

			{disabled ? (
				<Card className="border-amber-500/40">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-sm font-semibold">
							<ShieldCheck className="size-4 text-amber-500" />
							{isIndonesian ? "Fitur dinonaktifkan" : "Feature disabled"}
						</CardTitle>
						<CardDescription className="text-xs">
							{isIndonesian
								? "Asisten AI dinonaktifkan oleh admin untuk akun ini. Hubungi admin jika membutuhkan akses."
								: "The AI Assistant has been disabled by an administrator for this account. Contact an administrator if you need access."}
						</CardDescription>
					</CardHeader>
				</Card>
			) : (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-sm font-semibold">
							<Bot className="size-4 text-primary" />
							{isIndonesian
								? "Mau dibantu apa?"
								: "What do you need help with?"}
						</CardTitle>
						<CardDescription className="text-xs">
							{isIndonesian
								? "Pilih salah satu contoh di bawah, atau langsung tulis pertanyaanmu."
								: "Pick an example below, or type your question directly."}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form
							className="flex flex-col gap-4"
							onSubmit={(event) => {
								event.preventDefault();
								submit();
							}}
						>
							<div className="grid gap-2 sm:grid-cols-2">
								{QUICK_ACTIONS.map((action) => {
									const Icon = action.icon;
									const selected = selectedAction === action.id;
									return (
										<button
											key={action.id}
											type="button"
											onClick={() => selectAction(action)}
											className={cn(
												"flex items-start gap-2 rounded-lg border p-3 text-left transition-colors hover:border-primary/50 hover:bg-accent",
												selected && "border-primary bg-accent",
											)}
										>
											<Icon className="mt-0.5 size-4 shrink-0 text-primary" />
											<span className="min-w-0">
												<span className="block text-xs font-medium">
													{isIndonesian ? action.labelId : action.labelEn}
												</span>
												<span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
													{isIndonesian ? action.hintId : action.hintEn}
												</span>
											</span>
										</button>
									);
								})}
							</div>

							<div className="space-y-1">
								<Label htmlFor="aiAssistMessage" className="text-[10px]">
									{isIndonesian ? "Pertanyaan" : "Question"}
								</Label>
								<Textarea
									id="aiAssistMessage"
									ref={messageRef}
									value={message}
									onChange={(event) => {
										setMessage(event.target.value);
										setSelectedAction(null);
									}}
									placeholder={
										isIndonesian
											? "Contoh: Ringkas tren kehadiran bulan ini dan sarankan tindakan."
											: "Example: Summarize this month's attendance trend and suggest actions."
									}
									required
									className="min-h-28 text-xs"
								/>
							</div>

							<Collapsible
								open={contextOpen}
								onOpenChange={setContextOpen}
								className="flex flex-col gap-2"
							>
								<CollapsibleTrigger asChild>
									<Button
										type="button"
										size="sm"
										variant="ghost"
										className="h-8 justify-start self-start px-2 text-xs text-muted-foreground"
									>
										<ChevronDown
											className={cn(
												"size-4 transition-transform",
												contextOpen && "rotate-180",
											)}
										/>
										{isIndonesian
											? "Tambahkan data pendukung (opsional)"
											: "Add supporting data (optional)"}
									</Button>
								</CollapsibleTrigger>
								<CollapsibleContent className="space-y-1">
									<Label htmlFor="aiAssistContext" className="text-[10px]">
										{isIndonesian ? "Data pendukung" : "Supporting data"}
									</Label>
									<Textarea
										id="aiAssistContext"
										value={context}
										onChange={(event) => setContext(event.target.value)}
										placeholder={
											isIndonesian
												? "Tempel ringkasan, angka, atau catatan. Format bebas, tidak perlu JSON."
												: "Paste a summary, numbers, or notes. Plain text is fine, no JSON needed."
										}
										className="min-h-20 text-xs"
									/>
									<p className="text-[11px] text-muted-foreground">
										{isIndonesian
											? "Email, telepon, NIK, NPWP, nomor rekening, dan alamat disensor otomatis sebelum dikirim ke AI."
											: "Email, phone, ID numbers, tax IDs, bank accounts, and addresses are redacted automatically before being sent to the AI."}
									</p>
									<p className="text-[11px] text-muted-foreground">
										{isIndonesian
											? "Data pendukung tidak disimpan. Hanya hasil AI yang sudah disensor dan catatan audit yang tersimpan."
											: "Supporting data is not stored. Only the redacted AI result and an audit record are saved."}
									</p>
								</CollapsibleContent>
							</Collapsible>

							<div className="flex items-center justify-between gap-3">
								<Button
									type="submit"
									size="sm"
									disabled={assist.isPending || message.trim() === ""}
								>
									<Send className="size-4" />
									{assist.isPending
										? isIndonesian
											? "Memproses…"
											: "Working…"
										: isIndonesian
											? "Tanya AI"
											: "Ask AI"}
								</Button>
								<p className="text-[11px] text-muted-foreground">
									{isIndonesian
										? "Hasil AI perlu ditinjau sebelum dipakai."
										: "AI results need review before use."}
								</p>
							</div>
						</form>
					</CardContent>
				</Card>
			)}

			{result !== undefined && (
				<Card aria-live="polite">
					<CardHeader>
						<CardTitle className="flex flex-wrap items-center gap-2 text-sm font-semibold">
							{isIndonesian ? "Hasil" : "Result"}
							<Badge
								variant={
									result.riskLevel === "high"
										? "destructive"
										: result.riskLevel === "medium"
											? "outline"
											: "default"
								}
								className="text-[10px] uppercase"
							>
								{result.riskLevel}
							</Badge>
							<Badge variant="outline" className="text-[10px]">
								{result.confidence}%
							</Badge>
							<Badge variant="secondary" className="text-[10px]">
								{displayStatus === "approved"
									? AI_GOVERNANCE_MESSAGE.APPROVED
									: displayStatus === "rejected"
										? AI_GOVERNANCE_MESSAGE.REJECTED
										: AI_GOVERNANCE_MESSAGE.PENDING}
							</Badge>
						</CardTitle>
						<CardDescription className="text-xs">
							{result.model} ·{" "}
							{result.redactionApplied ? AI_GOVERNANCE_MESSAGE.REDACTED : ""}
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col gap-3 text-xs">
						<div>
							<div className="font-semibold">
								{isIndonesian ? "Ringkasan" : "Summary"}
							</div>
							<p className="mt-1 whitespace-pre-wrap text-muted-foreground">
								{result.summary}
							</p>
						</div>
						<div>
							<div className="font-semibold">
								{isIndonesian ? "Rekomendasi" : "Recommendation"}
							</div>
							<p className="mt-1 whitespace-pre-wrap text-muted-foreground">
								{result.recommendation}
							</p>
						</div>
						<p className="text-[11px] text-muted-foreground">
							{displayStatus === "pending_review"
								? isIndonesian
									? "Hasil ini menunggu review. Setujui atau tolak langsung di sini."
									: "This result awaits review. Approve or reject it right here."
								: isIndonesian
									? "Hasil sudah ditinjau dan siap dipakai sebagai referensi."
									: "This result has been reviewed and is ready to use as a reference."}
						</p>
						{displayStatus === "pending_review" && (
							<div className="flex flex-wrap gap-2">
								<Button
									type="button"
									size="sm"
									disabled={reviewing}
									onClick={() => review("approved")}
								>
									<Check className="size-4" />
									{isIndonesian ? "Setujui" : "Approve"}
								</Button>
								<Button
									type="button"
									size="sm"
									variant="outline"
									disabled={reviewing}
									onClick={() => review("rejected")}
								>
									<X className="size-4" />
									{isIndonesian ? "Tolak" : "Reject"}
								</Button>
							</div>
						)}
						<div className="flex flex-wrap gap-2">
							<Button size="sm" variant="outline" asChild>
								<Link to="/ai-governance">
									{isIndonesian
										? "Tinjau di AI Governance"
										: "Review in AI Governance"}
								</Link>
							</Button>
							<Button
								type="button"
								size="sm"
								variant="ghost"
								onClick={() => {
									assist.reset();
									messageRef.current?.focus();
								}}
							>
								<RotateCcw className="size-4" />
								{isIndonesian ? "Tanya lagi" : "Ask again"}
							</Button>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export const Route = createFileRoute("/_authenticated/ai-assistant/")({
	beforeLoad: checkRoutePermissions({
		permissions: [PERMISSION.AI_GOVERNANCE_MANAGE],
	}),
	component: AiAssistantPage,
});
