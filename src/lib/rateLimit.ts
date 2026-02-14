import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SubscriptionTier } from '../../generated/prisma/client';
import { RATE_LIMIT_CONFIG, RateLimitBucket } from './rateLimitConfig';

async function checkRateLimit(
	identifier: string,
	bucket: RateLimitBucket,
	tier: SubscriptionTier | 'anonymous',
): Promise<{ success: boolean; remaining: number; resetAt: Date }> {
	const config = RATE_LIMIT_CONFIG[bucket];
	const maxRequests = config.maxRequests[tier];
	const windowMs = config.windowSeconds * 1000;
	const now = new Date();
	const windowStart = new Date(now.getTime() - windowMs);

	const existing = await prisma.rateLimit.findUnique({
		where: { identifier_bucket: { identifier, bucket } },
	});

	// No record or window expired — reset
	if (!existing || existing.windowStart < windowStart) {
		await prisma.rateLimit.upsert({
			where: { identifier_bucket: { identifier, bucket } },
			create: { identifier, bucket, windowStart: now, count: 1 },
			update: { windowStart: now, count: 1 },
		});

		return {
			success: maxRequests > 0,
			remaining: Math.max(0, maxRequests - 1),
			resetAt: new Date(now.getTime() + windowMs),
		};
	}

	// Within window and at/over limit
	if (existing.count >= maxRequests) {
		return {
			success: false,
			remaining: 0,
			resetAt: new Date(existing.windowStart.getTime() + windowMs),
		};
	}

	// Within window and under limit — increment
	await prisma.rateLimit.update({
		where: { identifier_bucket: { identifier, bucket } },
		data: { count: { increment: 1 } },
	});

	return {
		success: true,
		remaining: maxRequests - existing.count - 1,
		resetAt: new Date(existing.windowStart.getTime() + windowMs),
	};
}

function getClientIp(req: NextRequest): string {
	const forwarded = req.headers.get('x-forwarded-for');
	if (forwarded) {
		return forwarded.split(',')[0].trim();
	}
	return req.headers.get('x-real-ip') || 'unknown';
}

function buildRateLimitResponse(resetAt: Date): NextResponse {
	const retryAfter = Math.ceil((resetAt.getTime() - Date.now()) / 1000);
	return NextResponse.json(
		{
			error: 'Too many requests. Please try again later.',
			retryAfter,
		},
		{
			status: 429,
			headers: {
				'Retry-After': String(retryAfter),
				'X-RateLimit-Remaining': '0',
				'X-RateLimit-Reset': resetAt.toISOString(),
			},
		},
	);
}

export async function applyRateLimit(
	userId: number,
	bucket: RateLimitBucket,
	tier: SubscriptionTier,
): Promise<NextResponse | null> {
	const result = await checkRateLimit(String(userId), bucket, tier);
	if (!result.success) return buildRateLimitResponse(result.resetAt);
	return null;
}

export async function applyPublicRateLimit(
	req: NextRequest,
	bucket: RateLimitBucket,
): Promise<NextResponse | null> {
	const ip = getClientIp(req);
	const result = await checkRateLimit(ip, bucket, 'anonymous');
	if (!result.success) return buildRateLimitResponse(result.resetAt);
	return null;
}

export async function cleanupExpiredRateLimits(): Promise<number> {
	const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000);
	const result = await prisma.rateLimit.deleteMany({
		where: { windowStart: { lt: cutoff } },
	});
	return result.count;
}
