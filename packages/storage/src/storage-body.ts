import { match, P } from "ts-pattern";
import { type TStorageLimits, storageReadRejection } from "./storage-limits.ts";

const CONTENT_LENGTH_HEADER = "content-length";

export const storageDeclaredByteLength = (
	response: Response,
): number | undefined =>
	match(response.headers.get(CONTENT_LENGTH_HEADER))
		.with(P.nullish, (): number | undefined => undefined)
		.otherwise((header): number | undefined => {
			const parsed = Number(header.trim());
			return match(
				header.trim() !== "" && Number.isFinite(parsed) && parsed >= 0,
			)
				.with(true, (): number | undefined => parsed)
				.otherwise((): number | undefined => undefined);
		});

const concat = (chunks: readonly Uint8Array[], total: number): Uint8Array => {
	const merged = new Uint8Array(total);
	chunks.reduce((offset, chunk): number => {
		merged.set(chunk, offset);
		return offset + chunk.byteLength;
	}, 0);
	return merged;
};

export const storageBodyRead = async (
	limits: TStorageLimits,
	key: string,
	body: ReadableStream<Uint8Array> | null,
): Promise<Uint8Array> => {
	const stream = match(body)
		.with(P.nullish, (): ReadableStream<Uint8Array> | null => null)
		.otherwise((found): ReadableStream<Uint8Array> => found);

	return match(stream)
		.with(P.nullish, async (): Promise<Uint8Array> => new Uint8Array(0))
		.otherwise(async (found): Promise<Uint8Array> => {
			const reader = found.getReader();
			const chunks: Uint8Array[] = [];
			let total = 0;

			try {
				let step = await reader.read();

				while (step.done === false) {
					total += step.value.byteLength;

					match(storageReadRejection(limits, key, total))
						.with(P.nonNullable, (rejection): void => {
							throw rejection;
						})
						.otherwise((): void => undefined);

					chunks.push(step.value);
					step = await reader.read();
				}

				return concat(chunks, total);
			} catch (error) {
				await reader.cancel().catch((): void => undefined);
				throw error;
			}
		});
};
