import { usePermissions } from "@app/components/guard/use-permissions";
import { A } from "@mobily/ts-belt";
import { useI18n } from "#/libs/i18n/index.ts";
import {
	NAV_ITEMS,
	type TNavItem,
} from "#/routes/_authenticated/_constants/nav.ts";

export const useVisibleNav = (): readonly TNavItem[] => {
	const { canAll } = usePermissions();
	const { t } = useI18n();

	return A.filter(NAV_ITEMS, (item) => canAll(item.permissions)).map(
		(item) => ({
			...item,
			label: t(`nav.${item.key}`),
		}),
	);
};
