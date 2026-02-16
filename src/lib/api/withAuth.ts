import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/services/getUserService';
import { applyRateLimit } from '@/lib/rateLimit';
import { RateLimitBucket } from '@/lib/rateLimitConfig';
import { jsonAuthError, json500 } from './responses';

// ============================================================================
// AUTHENTICATED ROUTE WRAPPER
//
// THE PROBLEM:
// Every API route repeats the same 4 lines:
//   const { user, error } = await getApiUser();
//   if (error) return jsonAuthError(error);
//   const rateLimited = await applyRateLimit(user.id, 'bucket', user.tier);
//   if (rateLimited) return rateLimited;
//
// If you forget this in a new route, that route is wide open. If you copy-paste
// wrong, you might use the wrong rate limit bucket. It's error-prone.
//
// THE SOLUTION:
// This wrapper handles auth + rate limiting, then passes the verified user
// to your handler. Your route only contains business logic.
//
// BEFORE:
//   export async function GET(req: NextRequest) {
//     const { user, error } = await getApiUser();
//     if (error) return jsonAuthError(error);
//     const rateLimited = await applyRateLimit(user.id, 'crud-read', user.subscriptionTier);
//     if (rateLimited) return rateLimited;
//     // ... your logic
//   }
//
// AFTER:
//   export const GET = withAuth({ rateLimit: 'crud-read' }, async (req, user) => {
//     // ... your logic — user is guaranteed to exist
//   });
//
// WHAT THIS MEANS FOR FUTURE DEVELOPMENT:
// - New routes automatically get auth + rate limiting by using withAuth()
// - You can't accidentally forget auth on a new endpoint
// - Changing the auth flow (e.g., adding permissions) only requires editing this file
// - Rate limit buckets are explicit and type-checked
// ============================================================================

// The user type from getApiUser — everything Prisma returns for this user
type AuthenticatedUser = NonNullable<Awaited<ReturnType<typeof getApiUser>>['user']>;

type AuthenticatedHandler = (
	request: NextRequest,
	user: AuthenticatedUser,
	params?: any,
) => Promise<NextResponse>;

interface WithAuthOptions {
	rateLimit: RateLimitBucket;
}

export function withAuth(options: WithAuthOptions, handler: AuthenticatedHandler) {
	return async (request: NextRequest, context?: { params?: Promise<any> }) => {
		try {
			const { user, error } = await getApiUser();
			if (error) return jsonAuthError(error);

			const rateLimited = await applyRateLimit(
				user!.id,
				options.rateLimit,
				user!.subscriptionTier,
			);
			if (rateLimited) return rateLimited;

			const params = context?.params ? await context.params : undefined;
			return await handler(request, user!, params);
		} catch (error) {
			console.error(`Route error [${request.method} ${request.nextUrl.pathname}]:`, error);
			return json500('Internal server error');
		}
	};
}
