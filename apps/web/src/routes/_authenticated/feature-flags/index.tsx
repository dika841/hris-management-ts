import { FEATURE_FLAG_MESSAGE, NAV_MESSAGE } from "@app/messages";
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
import { Switch } from "@app/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@app/components/ui/table";
import { Textarea } from "@app/components/ui/textarea";
import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import { useI18n } from "#/libs/i18n/index.ts";
import {
	featureFlagListOptions,
	useFeatureFlagCreate,
	useFeatureFlagDelete,
	useFeatureFlagEvaluation,
	useFeatureFlagList,
	useFeatureFlagUpdate,
} from "#/routes/_authenticated/_hooks/use-feature-flags.ts";
import type { TFeatureFlag } from "@app/schemas";
import { createFileRoute } from "@tanstack/react-router";
import { Flag, Plus, Trash2 } from "lucide-react";
import { useState, type FC, type ReactElement } from "react";

const FeatureFlagRow: FC<{ flag: TFeatureFlag; enabledForUser: boolean }> = ({
	flag,
	enabledForUser,
}): ReactElement => {
	const { isIndonesian } = useI18n();
	const update = useFeatureFlagUpdate();
	const remove = useFeatureFlagDelete();
	const [name, setName] = useState(flag.name);
	const [description, setDescription] = useState(flag.description ?? "");
	const [rollout, setRollout] = useState(String(flag.rolloutPercentage));

	const dirty =
		name !== flag.name ||
		description !== (flag.description ?? "") ||
		Number(rollout) !== flag.rolloutPercentage;

	const save = (): void => {
		update.mutate({
			id: flag.id,
			name,
			description: description.trim() === "" ? null : description,
			rolloutPercentage: Math.max(0, Math.min(100, Number(rollout) || 0)),
		});
	};

	return (
		<TableRow>
			<TableCell className="align-top">
				<code className="rounded bg-muted px-1.5 py-0.5 text-[11px]">
					{flag.key}
				</code>
			</TableCell>
			<TableCell className="align-top">
				<Input
					value={name}
					onChange={(event) => setName(event.target.value)}
					className="h-8 min-w-40 text-xs"
				/>
				<Textarea
					value={description}
					onChange={(event) => setDescription(event.target.value)}
					placeholder={isIndonesian ? "Deskripsi" : "Description"}
					className="mt-1 min-h-14 min-w-52 text-xs"
				/>
			</TableCell>
			<TableCell className="align-top">
				<div className="flex items-center gap-2">
					<Switch
						checked={flag.enabled}
						onCheckedChange={(checked) =>
							update.mutate({ id: flag.id, enabled: checked })
						}
					/>
					<span className="text-[11px] text-muted-foreground">
						{flag.enabled
							? isIndonesian
								? "Aktif"
								: "On"
							: isIndonesian
								? "Nonaktif"
								: "Off"}
					</span>
				</div>
			</TableCell>
			<TableCell className="align-top">
				<div className="flex items-center gap-1">
					<Input
						type="number"
						min={0}
						max={100}
						value={rollout}
						onChange={(event) => setRollout(event.target.value)}
						className="h-8 w-20 text-xs"
					/>
					<span className="text-xs text-muted-foreground">%</span>
				</div>
				<Badge
					variant={enabledForUser ? "default" : "outline"}
					className="mt-1 text-[10px]"
				>
					{enabledForUser
						? isIndonesian
							? "Anda: aktif"
							: "You: on"
						: isIndonesian
							? "Anda: nonaktif"
							: "You: off"}
				</Badge>
			</TableCell>
			<TableCell className="align-top">
				<div className="flex justify-end gap-1">
					{dirty && (
						<Button size="sm" variant="outline" onClick={save}>
							{isIndonesian ? "Simpan" : "Save"}
						</Button>
					)}
					<Button
						size="icon"
						variant="ghost"
						aria-label={
							isIndonesian ? "Hapus feature flag" : "Delete feature flag"
						}
						onClick={() => {
							if (
								window.confirm(
									isIndonesian
										? `Hapus feature flag "${flag.key}"?`
										: `Delete feature flag "${flag.key}"?`,
								)
							) {
								remove.mutate({ id: flag.id });
							}
						}}
					>
						<Trash2 className="size-4 text-rose-500" />
					</Button>
				</div>
			</TableCell>
		</TableRow>
	);
};

const FeatureFlagsPage: FC = (): ReactElement => {
	const { isIndonesian } = useI18n();
	const { data: flags } = useFeatureFlagList();
	const { data: evaluation } = useFeatureFlagEvaluation();
	const create = useFeatureFlagCreate();

	const [key, setKey] = useState("");
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [enabled, setEnabled] = useState(false);
	const [rollout, setRollout] = useState("0");

	const submit = (): void => {
		create.mutate(
			{
				key,
				name,
				description: description.trim() === "" ? undefined : description,
				enabled,
				rolloutPercentage: Math.max(0, Math.min(100, Number(rollout) || 0)),
			},
			{
				onSuccess: (): void => {
					setKey("");
					setName("");
					setDescription("");
					setEnabled(false);
					setRollout("0");
				},
			},
		);
	};

	return (
		<div className="flex flex-col gap-6">
			<div>
				<h1 className="flex items-center gap-2 text-xl font-bold tracking-tight">
					<Flag className="size-5 text-primary" />
					{NAV_MESSAGE.FEATURE_FLAGS}
				</h1>
				<p className="mt-1 text-xs text-muted-foreground">
					{isIndonesian
						? "Kontrol ketersediaan fitur dengan rollout persentase per pengguna."
						: FEATURE_FLAG_MESSAGE.DESCRIPTION}
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-sm font-semibold">
						{isIndonesian ? "Buat Feature Flag" : FEATURE_FLAG_MESSAGE.CREATE}
					</CardTitle>
					<CardDescription className="text-xs">
						{isIndonesian
							? "Key tidak bisa diubah setelah dibuat."
							: "The key cannot be changed after creation."}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6"
						onSubmit={(event) => {
							event.preventDefault();
							submit();
						}}
					>
						<div className="space-y-1 lg:col-span-1">
							<Label htmlFor="flagKey" className="text-[10px]">
								{FEATURE_FLAG_MESSAGE.KEY}
							</Label>
							<Input
								id="flagKey"
								value={key}
								onChange={(event) => setKey(event.target.value)}
								placeholder="ai_assistant"
								required
								className="h-8 text-xs"
							/>
						</div>
						<div className="space-y-1 lg:col-span-2">
							<Label htmlFor="flagName" className="text-[10px]">
								{FEATURE_FLAG_MESSAGE.NAME}
							</Label>
							<Input
								id="flagName"
								value={name}
								onChange={(event) => setName(event.target.value)}
								placeholder={isIndonesian ? "Asisten AI" : "AI Assistant"}
								required
								className="h-8 text-xs"
							/>
						</div>
						<div className="space-y-1 lg:col-span-2">
							<Label htmlFor="flagDescription" className="text-[10px]">
								{FEATURE_FLAG_MESSAGE.DESCRIPTION_FIELD}
							</Label>
							<Input
								id="flagDescription"
								value={description}
								onChange={(event) => setDescription(event.target.value)}
								className="h-8 text-xs"
							/>
						</div>
						<div className="space-y-1 lg:col-span-1">
							<Label htmlFor="flagRollout" className="text-[10px]">
								{FEATURE_FLAG_MESSAGE.ROLLOUT}
							</Label>
							<Input
								id="flagRollout"
								type="number"
								min={0}
								max={100}
								value={rollout}
								onChange={(event) => setRollout(event.target.value)}
								className="h-8 text-xs"
							/>
						</div>
						<div className="flex items-center gap-2">
							<Switch
								checked={enabled}
								onCheckedChange={setEnabled}
								aria-label={FEATURE_FLAG_MESSAGE.ENABLED}
							/>
							<span className="text-xs">{FEATURE_FLAG_MESSAGE.ENABLED}</span>
						</div>
						<div className="flex items-end lg:col-span-5 lg:justify-end">
							<Button type="submit" size="sm" disabled={create.isPending}>
								<Plus className="size-4" />
								{FEATURE_FLAG_MESSAGE.CREATE}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>

			<Card className="overflow-hidden">
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow className="bg-muted/30">
								<TableHead className="text-xs">
									{FEATURE_FLAG_MESSAGE.KEY}
								</TableHead>
								<TableHead className="text-xs">
									{FEATURE_FLAG_MESSAGE.NAME}
								</TableHead>
								<TableHead className="text-xs">
									{FEATURE_FLAG_MESSAGE.ENABLED}
								</TableHead>
								<TableHead className="text-xs">
									{FEATURE_FLAG_MESSAGE.ROLLOUT}
								</TableHead>
								<TableHead />
							</TableRow>
						</TableHeader>
						<TableBody>
							{flags.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={5}
										className="py-8 text-center text-xs text-muted-foreground"
									>
										{isIndonesian
											? "Belum ada feature flag."
											: FEATURE_FLAG_MESSAGE.EMPTY}
									</TableCell>
								</TableRow>
							) : (
								flags.map((flag) => (
									<FeatureFlagRow
										key={flag.id}
										flag={flag}
										enabledForUser={
											evaluation?.find((item) => item.key === flag.key)
												?.enabled ?? false
										}
									/>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
};

export const Route = createFileRoute("/_authenticated/feature-flags/")({
	beforeLoad: checkRoutePermissions({ permissions: [PERMISSION.USER_MANAGE] }),
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(featureFlagListOptions()),
	component: FeatureFlagsPage,
});
