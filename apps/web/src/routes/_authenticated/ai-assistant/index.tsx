import { AI_GOVERNANCE_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import { Badge } from "@app/components/ui/badge";
import { Button } from "@app/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@app/components/ui/card";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { Textarea } from "@app/components/ui/textarea";
import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import { useI18n } from "#/libs/i18n/index.ts";
import { useAiAssist } from "#/routes/_authenticated/_hooks/use-ai-assist.ts";
import { useFeatureFlag } from "#/routes/_authenticated/_hooks/use-feature-flags.ts";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bot, Send, ShieldCheck, Sparkles } from "lucide-react";
import { useState, type FC, type ReactElement } from "react";

const AiAssistantPage: FC = (): ReactElement => {
	const { isIndonesian } = useI18n();
	const enabled = useFeatureFlag("ai_assistant");
	const assist = useAiAssist();

	const [feature, setFeature] = useState("hr_assistant");
	const [message, setMessage] = useState("");
	const [context, setContext] = useState("");
	const [contextError, setContextError] = useState("");

	const submit = (): void => {
		let parsedContext: unknown;
		if (context.trim() !== "") {
			try {
				parsedContext = JSON.parse(context);
			} catch {
				setContextError(
					isIndonesian
						? "Konteks harus JSON valid."
						: "Context must be valid JSON.",
				);
				return;
			}
		}
		setContextError("");
		assist.mutate({
			feature,
			message,
			...(parsedContext === undefined ? {} : { context: parsedContext }),
		});
	};

	const result = assist.data;

	return (
		<div className="flex flex-col gap-6">
			<div>
				<h1 className="flex items-center gap-2 text-xl font-bold tracking-tight">
					<Sparkles className="size-5 text-primary" />
					{isIndonesian ? "Asisten AI" : "AI Assistant"}
				</h1>
				<p className="mt-1 text-xs text-muted-foreground">
					{isIndonesian
						? "Ditenagai DeepSeek. PII diredaksi dan setiap keputusan masuk review queue."
						: "Powered by DeepSeek. PII is redacted and every decision enters the review queue."}
				</p>
			</div>

			{!enabled ? (
				<Card className="border-amber-500/40">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-sm font-semibold">
							<ShieldCheck className="size-4 text-amber-500" />
							{isIndonesian ? "Fitur belum aktif" : "Feature not enabled"}
						</CardTitle>
						<CardDescription className="text-xs">
							{isIndonesian
								? "Aktifkan feature flag ai_assistant untuk akun Anda melalui halaman Feature Flags."
								: "Enable the ai_assistant feature flag for your account on the Feature Flags page."}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button size="sm" variant="outline" asChild>
							<Link to="/feature-flags">
								{isIndonesian ? "Buka Feature Flags" : "Open Feature Flags"}
							</Link>
						</Button>
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-sm font-semibold">
							<Bot className="size-4 text-primary" />
							{isIndonesian ? "Ajukan tugas" : "Ask for assistance"}
						</CardTitle>
						<CardDescription className="text-xs">
							{isIndonesian
								? "Jangan kirim data pribadi. Sistem tetap meredaksi email, telepon, dan NIK sebelum dikirim."
								: "Do not send personal data. Email, phone, and ID numbers are redacted before sending."}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form
							className="flex flex-col gap-3"
							onSubmit={(event) => {
								event.preventDefault();
								submit();
							}}
						>
							<div className="space-y-1">
								<Label htmlFor="aiAssistFeature" className="text-[10px]">
									{AI_GOVERNANCE_MESSAGE.FEATURE}
								</Label>
								<Input
									id="aiAssistFeature"
									value={feature}
									onChange={(event) => setFeature(event.target.value)}
									required
									className="h-8 text-xs"
								/>
							</div>
							<div className="space-y-1">
								<Label htmlFor="aiAssistMessage" className="text-[10px]">
									{isIndonesian ? "Instruksi" : "Instruction"}
								</Label>
								<Textarea
									id="aiAssistMessage"
									value={message}
									onChange={(event) => setMessage(event.target.value)}
									placeholder={
										isIndonesian
											? "Ringkas tren kehadiran bulan ini dan sarankan tindakan."
											: "Summarize this month's attendance trend and suggest actions."
									}
									required
									className="min-h-28 text-xs"
								/>
							</div>
							<div className="space-y-1">
								<Label htmlFor="aiAssistContext" className="text-[10px]">
									{isIndonesian
										? "Konteks JSON (opsional)"
										: "JSON context (optional)"}
								</Label>
								<Textarea
									id="aiAssistContext"
									value={context}
									onChange={(event) => setContext(event.target.value)}
									placeholder='{"period":"2026-10"}'
									className="min-h-20 font-mono text-xs"
								/>
								{contextError !== "" && (
									<p className="text-[11px] text-rose-500">{contextError}</p>
								)}
							</div>
							<div>
								<Button type="submit" size="sm" disabled={assist.isPending}>
									<Send className="size-4" />
									{assist.isPending
										? isIndonesian
											? "Memproses…"
											: "Working…"
										: isIndonesian
											? "Jalankan"
											: "Run"}
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			)}

			{result !== undefined && (
				<Card>
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
								{result.status === "approved"
									? AI_GOVERNANCE_MESSAGE.APPROVED
									: result.status === "rejected"
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
						<Button size="sm" variant="outline" asChild>
							<Link to="/ai-governance">
								{isIndonesian
									? "Lihat di AI Governance"
									: "Open in AI Governance"}
							</Link>
						</Button>
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
