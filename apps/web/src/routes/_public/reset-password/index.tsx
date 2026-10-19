import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import type { FC, FormEvent, ReactElement } from "react";
import { useState } from "react";
import { AUTH_BASE_URL } from "#/libs/auth/client.ts";
import { useI18n } from "#/libs/i18n/index.ts";
import { LoginLayout } from "#/routes/_public/login/_components/login-layout.tsx";

type TResetSearch = {
	token?: string;
	error?: string;
};

const ResetPasswordPage: FC = (): ReactElement => {
	const { isIndonesian } = useI18n();
	const { token, error: searchError } = Route.useSearch();
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [done, setDone] = useState(false);
	const [pending, setPending] = useState(false);

	const submit = async (event: FormEvent): Promise<void> => {
		event.preventDefault();
		setError(null);

		if (!token) {
			setError(
				isIndonesian
					? "Token reset tidak valid atau sudah kedaluwarsa."
					: "The reset token is missing, invalid, or expired.",
			);
			return;
		}
		if (password !== confirm) {
			setError(
				isIndonesian
					? "Konfirmasi kata sandi tidak cocok."
					: "Password confirmation does not match.",
			);
			return;
		}
		if (password.length < 8) {
			setError(
				isIndonesian
					? "Kata sandi minimal 8 karakter."
					: "Password must be at least 8 characters.",
			);
			return;
		}

		setPending(true);
		try {
			const response = await fetch(`${AUTH_BASE_URL}/reset-password`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ newPassword: password, token }),
			});
			if (!response.ok) {
				const body = (await response.json().catch(() => null)) as {
					message?: string;
				} | null;
				setError(
					body?.message ??
						(isIndonesian
							? "Gagal mengatur ulang kata sandi. Tautan mungkin sudah kedaluwarsa."
							: "Unable to reset the password. The link may have expired."),
				);
				return;
			}
			setDone(true);
		} catch {
			setError(
				isIndonesian
					? "Tidak dapat menghubungi server."
					: "Could not reach the server.",
			);
		} finally {
			setPending(false);
		}
	};

	const invalid = !token || searchError !== undefined;

	return (
		<LoginLayout>
			<div className="flex flex-col gap-6">
				<div className="flex flex-col items-center gap-2 text-center">
					<h1 className="text-2xl font-bold">
						{isIndonesian ? "Atur Ulang Kata Sandi" : "Reset Password"}
					</h1>
					<p className="text-sm text-muted-foreground">
						{isIndonesian
							? "Buat kata sandi baru untuk akun Anda."
							: "Create a new password for your account."}
					</p>
				</div>

				{done ? (
					<div className="flex flex-col items-center gap-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-5 text-center text-sm">
						<CheckCircle2 className="size-8 text-emerald-500" />
						<p>
							{isIndonesian
								? "Kata sandi berhasil diubah. Silakan masuk dengan kata sandi baru."
								: "Your password has been changed. Please sign in with the new password."}
						</p>
						<Button asChild className="w-full">
							<Link to="/login">
								{isIndonesian ? "Masuk ke Akun" : "Sign in"}
							</Link>
						</Button>
					</div>
				) : invalid ? (
					<div className="flex flex-col items-center gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-5 text-center text-sm">
						<ShieldAlert className="size-8 text-destructive" />
						<p>
							{isIndonesian
								? "Tautan reset tidak valid atau sudah kedaluwarsa. Minta tautan baru."
								: "This reset link is invalid or expired. Request a new one."}
						</p>
						<Button asChild variant="outline" className="w-full">
							<Link to="/forgot-password">
								{isIndonesian ? "Minta Tautan Baru" : "Request New Link"}
							</Link>
						</Button>
					</div>
				) : (
					<form onSubmit={submit} className="flex flex-col gap-4">
						<div className="grid gap-1.5">
							<Label htmlFor="newPassword">
								{isIndonesian ? "Kata Sandi Baru" : "New Password"}
							</Label>
							<Input
								id="newPassword"
								type="password"
								required
								minLength={8}
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								placeholder={
									isIndonesian ? "Minimal 8 karakter" : "At least 8 characters"
								}
							/>
						</div>
						<div className="grid gap-1.5">
							<Label htmlFor="confirmPassword">
								{isIndonesian ? "Ulangi Kata Sandi" : "Confirm Password"}
							</Label>
							<Input
								id="confirmPassword"
								type="password"
								required
								minLength={8}
								value={confirm}
								onChange={(event) => setConfirm(event.target.value)}
								placeholder={
									isIndonesian
										? "Ulangi kata sandi baru"
										: "Repeat the new password"
								}
							/>
						</div>

						{error && (
							<p role="alert" className="text-xs text-destructive">
								{error}
							</p>
						)}

						<Button type="submit" disabled={pending} className="w-full">
							{pending && <Loader2 className="animate-spin" />}
							{isIndonesian ? "Simpan Kata Sandi" : "Save Password"}
						</Button>
					</form>
				)}
			</div>
		</LoginLayout>
	);
};

export const Route = createFileRoute("/_public/reset-password/")({
	validateSearch: (search: Record<string, unknown>): TResetSearch => ({
		token: typeof search.token === "string" ? search.token : undefined,
		error: typeof search.error === "string" ? search.error : undefined,
	}),
	component: ResetPasswordPage,
});
