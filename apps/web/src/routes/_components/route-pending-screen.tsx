import { Skeleton } from "@app/components/ui/skeleton";
import { APP_MESSAGE } from "@app/messages";
import { A } from "@mobily/ts-belt";
import type { FC, ReactElement } from "react";

const PENDING_ROWS = ["first", "second", "third", "fourth", "fifth"] as const;
const PENDING_CELLS = ["first", "second", "third", "fourth"] as const;

export const RoutePendingScreen: FC = (): ReactElement => (
	<output
		aria-label={APP_MESSAGE.LOADING}
		className="flex w-full flex-col gap-6"
	>
		<div className="flex flex-col gap-2 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-center gap-2">
				<Skeleton className="size-8 rounded-lg" />
				<div className="flex flex-col gap-2">
					<Skeleton className="h-6 w-40" />
					<Skeleton className="h-3 w-64" />
				</div>
			</div>
			<Skeleton className="h-8 w-28" />
		</div>
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-center gap-3">
				<Skeleton className="h-9 w-64" />
				<Skeleton className="ml-auto h-9 w-32" />
			</div>
			<div className="overflow-hidden rounded-lg border border-border/60">
				<div className="flex h-10 items-center gap-4 border-b border-border/40 bg-muted/30 px-4">
					{A.map(PENDING_CELLS, (cell) => (
						<Skeleton key={cell} className="h-3 flex-1" />
					))}
				</div>
				<div className="flex flex-col">
					{A.map(PENDING_ROWS, (row) => (
						<div
							key={row}
							className="flex h-12 items-center gap-4 border-b border-border/30 px-4 last:border-b-0"
						>
							{A.map(PENDING_CELLS, (cell) => (
								<Skeleton key={cell} className="h-4 flex-1" />
							))}
						</div>
					))}
				</div>
			</div>
		</div>
	</output>
);
