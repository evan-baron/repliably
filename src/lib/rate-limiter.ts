/**
 * In-memory sliding window rate limiter.
 * Suitable for single-instance deployments. For multi-instance,
 * consider Redis-backed solution.
 */

interface RateLimitEntry {
	timestamps: number[];
}

interface RateLimitConfig {
	windowMs: number; // Time window in milliseconds
	maxRequests: number; // Maximum requests allowed in window
}

// Preset rate limit configurations
export const RATE_LIMITS = {
	webhook: { windowMs: 60 * 1000, maxRequests: 100 }, // 100/min
	api: { windowMs: 60 * 1000, maxRequests: 60 }, // 60/min
	sendEmail: { windowMs: 60 * 60 * 1000, maxRequests: 100 }, // 100/hour
} as const;

export type RateLimitType = keyof typeof RATE_LIMITS;

class SlidingWindowRateLimiter {
	private entries: Map<string, RateLimitEntry> = new Map();
	private cleanupInterval: ReturnType<typeof setInterval> | null = null;

	constructor() {
		// Clean up old entries every minute to prevent memory leaks
		this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000);
	}

	/**
	 * Check if a request should be rate limited.
	 * Returns rate limit info including whether the request is allowed.
	 */
	check(
		identifier: string,
		config: RateLimitConfig
	): {
		allowed: boolean;
		limit: number;
		remaining: number;
		resetAt: number;
	} {
		const now = Date.now();
		const windowStart = now - config.windowMs;
		const key = identifier;

		// Get or create entry
		let entry = this.entries.get(key);
		if (!entry) {
			entry = { timestamps: [] };
			this.entries.set(key, entry);
		}

		// Remove timestamps outside the window
		entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

		// Calculate remaining requests
		const requestCount = entry.timestamps.length;
		const remaining = Math.max(0, config.maxRequests - requestCount);
		const allowed = requestCount < config.maxRequests;

		// Calculate reset time (when the oldest request in window expires)
		const resetAt =
			entry.timestamps.length > 0
				? entry.timestamps[0] + config.windowMs
				: now + config.windowMs;

		if (allowed) {
			// Record this request
			entry.timestamps.push(now);
		}

		return {
			allowed,
			limit: config.maxRequests,
			remaining: allowed ? remaining - 1 : 0,
			resetAt,
		};
	}

	/**
	 * Clean up old entries to prevent memory leaks.
	 */
	private cleanup(): void {
		const now = Date.now();
		// Use the longest window for cleanup (1 hour)
		const maxWindow = 60 * 60 * 1000;

		for (const [key, entry] of this.entries) {
			// Remove timestamps older than max window
			entry.timestamps = entry.timestamps.filter(
				(ts) => ts > now - maxWindow
			);

			// Remove entry if no timestamps remain
			if (entry.timestamps.length === 0) {
				this.entries.delete(key);
			}
		}
	}

	/**
	 * Stop the cleanup interval (for testing/shutdown).
	 */
	destroy(): void {
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval);
			this.cleanupInterval = null;
		}
	}
}

// Singleton instance
const rateLimiter = new SlidingWindowRateLimiter();

/**
 * Check rate limit for a given identifier and limit type.
 * Returns rate limit headers and whether the request is allowed.
 */
export function checkRateLimit(
	identifier: string,
	limitType: RateLimitType
): {
	allowed: boolean;
	headers: {
		'X-RateLimit-Limit': string;
		'X-RateLimit-Remaining': string;
		'X-RateLimit-Reset': string;
	};
} {
	const config = RATE_LIMITS[limitType];
	const result = rateLimiter.check(`${limitType}:${identifier}`, config);

	return {
		allowed: result.allowed,
		headers: {
			'X-RateLimit-Limit': String(result.limit),
			'X-RateLimit-Remaining': String(result.remaining),
			'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
		},
	};
}

/**
 * Helper to extract client IP from request.
 * Handles common proxy headers.
 */
export function getClientIp(request: Request): string {
	// Check common proxy headers
	const forwardedFor = request.headers.get('x-forwarded-for');
	if (forwardedFor) {
		// Take the first IP in the chain (original client)
		return forwardedFor.split(',')[0].trim();
	}

	const realIp = request.headers.get('x-real-ip');
	if (realIp) {
		return realIp;
	}

	// Fallback - this may not work in all environments
	return 'unknown';
}
