import { Button } from "@app/components/ui/button";
import { FieldError, hasFieldError } from "@app/components/ui/field-error";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { type FC, type ReactElement, useState } from "react";
import { useI18n } from "#/libs/i18n/index.ts";
import { useLoginForm } from "#/routes/_public/login/_hooks/use-login.ts";

export const LoginForm: FC = (): ReactElement => {
	const { form, serverError, onSubmit } = useLoginForm();
	const { t } = useI18n();
	const [showPassword, setShowPassword] = useState(false);

	return (
		<form onSubmit={onSubmit} className="flex flex-col gap-6">
			<div className="flex flex-col items-center gap-2 text-center">
				<h1 className="text-2xl font-bold">{t("auth.loginTitle")}</h1>
				<p className="text-muted-foreground text-sm text-balance">
					{t("auth.loginDescription")}
				</p>
			</div>
			<div className="grid gap-6">
				<form.Field name="email">
					{(field) => (
						<div className="grid gap-1.5">
							<Label htmlFor={field.name}>{t("auth.fieldEmail")}</Label>
							<Input
								id={field.name}
								type="email"
								placeholder={t("auth.emailPlaceholder")}
								aria-invalid={hasFieldError(field.state.meta.errorMap)}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
							<FieldError errorMap={field.state.meta.errorMap} />
						</div>
					)}
				</form.Field>
				<form.Field name="password">
					{(field) => (
						<div className="grid gap-1.5">
							<Label htmlFor={field.name}>{t("auth.fieldPassword")}</Label>
							<div className="relative">
								<Input
									id={field.name}
									type={showPassword ? "text" : "password"}
									placeholder={t("auth.passwordPlaceholder")}
									aria-invalid={hasFieldError(field.state.meta.errorMap)}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									className="pr-10"
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={() => setShowPassword((prev) => !prev)}
									className="text-muted-foreground hover:text-foreground absolute right-0 top-0 h-full w-9 hover:bg-transparent"
									aria-label={
										showPassword
											? t("auth.hidePassword")
											: t("auth.showPassword")
									}
								>
									{showPassword ? (
										<EyeOff className="size-4" />
									) : (
										<Eye className="size-4" />
									)}
								</Button>
							</div>
							<FieldError errorMap={field.state.meta.errorMap} />
						</div>
					)}
				</form.Field>
				<FieldError errors={serverError ? [{ message: serverError }] : []} />
				<form.Subscribe selector={(state) => state.isSubmitting}>
					{(isSubmitting) => (
						<Button type="submit" className="w-full" disabled={isSubmitting}>
							{isSubmitting && <Loader2 className="animate-spin" />}
							{isSubmitting ? t("auth.signingIn") : t("auth.loginAction")}
						</Button>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
};
