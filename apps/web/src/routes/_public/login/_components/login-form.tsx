import { Button } from "@app/components/ui/button";
import { FieldError, hasFieldError } from "@app/components/ui/field-error";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { Loader2 } from "lucide-react";
import type { FC, ReactElement } from "react";
import { useI18n } from "#/libs/i18n/index.ts";
import { useLoginForm } from "#/routes/_public/login/_hooks/use-login.ts";

export const LoginForm: FC = (): ReactElement => {
	const { form, serverError, onSubmit } = useLoginForm();
	const { t } = useI18n();

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
							<Input
								id={field.name}
								type="password"
								placeholder={t("auth.passwordPlaceholder")}
								aria-invalid={hasFieldError(field.state.meta.errorMap)}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
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
