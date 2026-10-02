import { Button } from "@app/components/ui/button";
import { FieldError } from "@app/components/ui/field-error";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import type { FC, ReactElement } from "react";
import { usePasswordChangeForm } from "#/routes/_authenticated/account/_hooks/use-password-change-form.ts";
import { Card, CardContent } from "@app/components/ui/card";
import { useI18n } from "#/libs/i18n/index.ts";
import { ConfirmDialog } from "#/routes/_authenticated/_components/confirm-dialog.tsx";

export const PasswordChangeForm: FC = (): ReactElement => {
	const { form, serverError, onSubmit, confirm, isPending } =
		usePasswordChangeForm();
	const { t } = useI18n();

	return (
		<Card>
			<CardContent>
				<form onSubmit={onSubmit} className="flex flex-col gap-4">
					<h2 className="font-medium">{t("auth.passwordChangeTitle")}</h2>
					<form.Field name="currentPassword">
						{(field) => (
							<div className="flex flex-col gap-1">
								<Label htmlFor={field.name}>
									{t("auth.fieldCurrentPassword")}
								</Label>
								<Input
									id={field.name}
									type="password"
									autoComplete="current-password"
									placeholder={t("auth.currentPasswordPlaceholder")}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
								/>
								<FieldError errors={field.state.meta.errors} />
							</div>
						)}
					</form.Field>
					<form.Field name="newPassword">
						{(field) => (
							<div className="flex flex-col gap-1">
								<Label htmlFor={field.name}>{t("auth.fieldNewPassword")}</Label>
								<Input
									id={field.name}
									type="password"
									autoComplete="new-password"
									placeholder={t("auth.newPasswordPlaceholder")}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
								/>
								<FieldError errors={field.state.meta.errors} />
							</div>
						)}
					</form.Field>
					<form.Field name="confirmPassword">
						{(field) => (
							<div className="flex flex-col gap-1">
								<Label htmlFor={field.name}>
									{t("auth.fieldConfirmPassword")}
								</Label>
								<Input
									id={field.name}
									type="password"
									autoComplete="new-password"
									placeholder={t("auth.confirmPasswordPlaceholder")}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
								/>
								<FieldError errors={field.state.meta.errors} />
							</div>
						)}
					</form.Field>
					<FieldError errors={serverError ? [{ message: serverError }] : []} />
					<Button type="submit" disabled={isPending} className="self-start">
						{isPending ? t("auth.passwordUpdating") : t("auth.passwordUpdate")}
					</Button>
				</form>
				<ConfirmDialog
					open={confirm.open}
					title={t("auth.passwordChangeConfirmTitle")}
					description={t("auth.passwordChangeConfirmDescription")}
					onOpenChange={confirm.onOpenChange}
					onConfirm={confirm.onConfirm}
				/>
			</CardContent>
		</Card>
	);
};
