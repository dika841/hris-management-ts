import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import type { FC, FormEvent, ReactElement } from "react";
import { useState } from "react";
import { AUTH_BASE_URL } from "#/libs/auth/client.ts";
import { useI18n } from "#/libs/i18n/index.ts";
import { LoginLayout } from "#/routes/_public/login/_components/login-layout.tsx";

const ForgotPasswordPage: FC = (): ReactElement => {
	const { isIndonesian } = useI18n();
	const [email, setEmail] = useState("");
	const [sent, setSent] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	const submit = async (event: FormEvent): Promise<void> => {
		event.preventDefault();
		setPending(true);
		setError(null);

		try {
			const response = await fetch(`${AUTH_BASE_URL}/request-password-reset`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					email,
					redirectTo: `${window.location.origin}/reset-password`,
				}),
			});
			if (!response.ok) {
				setError(
					isIndonesian
						? "Gagal mengirim email reset. Coba lagi."
						: "Unable to send the reset email. Please try again.",
				);
				return;
			}
			setSent(true);
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

	return (
		<LoginLayout>
			<div className="flex flex-col gap-6">
				<div className="flex flex-col items-center gap-2 text-center">
					<h1 className="text-2xl font-bold">
						{isIndonesian ? "Lupa Kata Sandi" : "Forgot Password"}
					</h1>
					<p className="text-sm text-muted-foreground">
						{isIndonesian
							? "Masukkan email akun Anda. Kami akan mengirim tautan untuk mengatur ulang kata sandi."
							: "Enter your account email. We will send a link to reset your password."}
					</p>
				</div>

				{sent ? (
					<div className="flex flex-col items-center gap-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-5 text-center text-sm">
						<MailCheck className="size-8 text-emerald-500" />
						<p>
							{isIndonesian
								? "Jika email terdaftar, tautan reset kata sandi sudah dikirim. Periksa kotak masuk Anda."
								: "If the email is registered, a reset link has been sent. Please check your inbox."}
						</p>
					</div>
				) : (
					<form onSubmit={submit} className="flex flex-col gap-4">
						<div className="grid gap-1.5">
							<Label htmlFor="email">{isIndonesian ? "Email" : "Email"}</Label>
							<Input
								id="email"
								type="email"
								required
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								placeholder={isIndonesian ? "nama@contoh.com" : "m@example.com"}
							/>
						</div>

						{error && (
							<p role="alert" className="text-xs text-destructive">
								{error}
							</p>
						)}

						<Button type="submit" disabled={pending} className="w-full">
							{pending && <Loader2 className="animate-spin" />}
							{isIndonesian ? "Kirim Tautan Reset" : "Send Reset Link"}
						</Button>
					</form>
				)}

				<Button variant="ghost" size="sm" asChild className="w-fit self-center">
					<Link to="/login">
						<ArrowLeft className="size-3.5" />
						{isIndonesian ? "Kembali ke Login" : "Back to Login"}
					</Link>
				</Button>
			</div>
		</LoginLayout>
	);
};

export const Route = createFileRoute("/_public/forgot-password/")({
	component: ForgotPasswordPage,
});
