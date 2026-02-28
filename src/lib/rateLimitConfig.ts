import { SubscriptionTier } from '../../generated/prisma/client';

export type RateLimitBucket =
	| 'send-email'
	| 'generate'
	| 'contacts-write'
	| 'check-replies'
	| 'crud-read'
	| 'crud-write'
	| 'auth-action'
	| 'waitlist';

type BucketConfig = {
	windowSeconds: number;
	maxRequests: Record<SubscriptionTier | 'anonymous', number>;
};

export const RATE_LIMIT_CONFIG: Record<RateLimitBucket, BucketConfig> = {
	'send-email': {
		windowSeconds: 300,
		maxRequests: { free: 10, basic: 30, pro: 100, elite: 300, anonymous: 0 },
	},
	generate: {
		windowSeconds: 300,
		maxRequests: { free: 15, basic: 50, pro: 150, elite: 500, anonymous: 0 },
	},
	'contacts-write': {
		windowSeconds: 300,
		maxRequests: { free: 20, basic: 60, pro: 200, elite: 500, anonymous: 0 },
	},
	'check-replies': {
		windowSeconds: 60,
		maxRequests: { free: 5, basic: 10, pro: 20, elite: 40, anonymous: 0 },
	},
	'crud-read': {
		windowSeconds: 60,
		maxRequests: { free: 60, basic: 120, pro: 240, elite: 600, anonymous: 0 },
	},
	'crud-write': {
		windowSeconds: 60,
		maxRequests: { free: 30, basic: 60, pro: 120, elite: 300, anonymous: 0 },
	},
	'auth-action': {
		windowSeconds: 300,
		maxRequests: { free: 10, basic: 10, pro: 20, elite: 20, anonymous: 0 },
	},
	waitlist: {
		windowSeconds: 300,
		maxRequests: { free: 0, basic: 0, pro: 0, elite: 0, anonymous: 5 },
	},
};
