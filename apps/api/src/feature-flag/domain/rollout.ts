import type { TFeatureFlag } from "@app/schemas";

export const rolloutBucket = (userId: string, key: string): number => {
	let hash = 2166136261;
	const input = `${userId}:${key}`;
	for (let index = 0; index < input.length; index += 1) {
		hash ^= input.charCodeAt(index);
		hash = Math.imul(hash, 16777619);
	}
	return Math.abs(hash) % 100;
};

export const isFlagEnabledFor = (flag: TFeatureFlag, userId: string): boolean =>
	flag.enabled && rolloutBucket(userId, flag.key) < flag.rolloutPercentage;
