import { Button } from "@app/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@app/components/ui/dropdown-menu";
import { Check, Globe, Languages } from "lucide-react";
import type { FC, ReactElement } from "react";
import type { TLocale } from "../locale.ts";
import { useI18n } from "../use-i18n.ts";

type TLanguageSwitcherProps = {
	variant?: "header" | "menu-item" | "compact";
	className?: string;
};

export const LanguageSwitcher: FC<TLanguageSwitcherProps> = ({
	variant = "header",
	className = "",
}): ReactElement => {
	const { locale, setLocale, toggleLocale, locales, t } = useI18n();

	if (variant === "menu-item") {
		return (
			<DropdownMenuItem
				onSelect={(event) => {
					event.preventDefault();
					toggleLocale();
				}}
				className={className}
			>
				<Languages className="size-4" />
				<span>{t("app.language")}</span>
				<span className="ml-auto text-xs font-semibold uppercase text-muted-foreground">
					{locales[locale].shortLabel}
				</span>
			</DropdownMenuItem>
		);
	}

	if (variant === "compact") {
		return (
			<Button
				variant="outline"
				size="sm"
				onClick={toggleLocale}
				className={`h-8 gap-1.5 px-2 text-xs font-medium border-border/60 ${className}`}
				title={t("app.selectLanguage")}
			>
				<Globe className="size-3.5 text-muted-foreground" />
				<span>{locales[locale].shortLabel}</span>
			</Button>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className={`h-8 gap-1.5 px-2.5 text-xs font-medium hover:bg-muted ${className}`}
					aria-label={t("app.selectLanguage")}
				>
					<Globe className="size-4 text-muted-foreground" />
					<span className="font-semibold uppercase tracking-wider">
						{locales[locale].shortLabel}
					</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-44">
				{Object.values(locales).map((info) => {
					const isSelected = info.code === locale;
					return (
						<DropdownMenuItem
							key={info.code}
							onClick={() => setLocale(info.code as TLocale)}
							className="flex items-center justify-between cursor-pointer"
						>
							<div className="flex items-center gap-2">
								<span className="text-sm">{info.flag}</span>
								<span className="text-xs font-medium">{info.nativeName}</span>
							</div>
							{isSelected && <Check className="size-3.5 text-primary" />}
						</DropdownMenuItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
