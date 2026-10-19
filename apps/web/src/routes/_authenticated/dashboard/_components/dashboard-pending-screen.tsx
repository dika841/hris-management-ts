import { Skeleton } from "@app/components/ui/skeleton";
import { APP_MESSAGE } from "@app/messages";
import { A } from "@mobily/ts-belt";
import type { FC, ReactElement } from "react";

const STAT_CARDS = ["first", "second", "third", "fourth"] as const;
const LIST_ROWS = ["first", "second", "third", "fourth"] as const;

export const DashboardPendingScreen: FC = (): ReactElement => (
	<output aria-label={APP_MESSAGE.LOADING} className="flex flex-col gap-6">
		<div className="flex flex-col gap-3 border-b border-border/40 pb-5 md:flex-row md:items-center md:justify-between">
			<div className="flex flex-col gap-2">
				<Skeleton className="h-8 w-52" />
				<Skeleton className="h-4 w-80 max-w-full" />
			</div>
			<div className="flex flex-wrap gap-2">
				<Skeleton className="h-7 w-36" />
				<Skeleton className="h-7 w-32" />
				<Skeleton className="h-7 w-28" />
			</div>
		</div>
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{A.map(STAT_CARDS, (card) => (
				<Skeleton key={card} className="h-[142px] rounded-xl" />
			))}
		</div>
		<Skeleton className="h-[320px] rounded-xl" />
		<div className="grid gap-6 lg:grid-cols-12">
			<div className="flex flex-col gap-6 lg:col-span-7">
				<Skeleton className="h-[260px] rounded-xl" />
				<Skeleton className="h-[220px] rounded-xl" />
			</div>
			<div className="flex flex-col gap-6 lg:col-span-5">
				{A.map(LIST_ROWS, (row) => (
					<Skeleton key={row} className="h-[140px] rounded-xl" />
				))}
			</div>
		</div>
	</output>
);
