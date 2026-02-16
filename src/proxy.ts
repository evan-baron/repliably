import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from './lib/auth0';

// ============================================================================
// PROXY: Next.js 16's replacement for middleware.ts
//
// This runs on EVERY matched request BEFORE it hits your route handler.
// It uses the Edge Runtime (lightweight V8) — no database access, no heavy
// Node.js modules like Prisma. But perfect for cookie checks, header injection,
// and request filtering.
//
// Auth0's SDK needs this file to handle session management (/auth/callback, etc.)
// We layer our security logic on top of Auth0's middleware.
// ============================================================================

// Auth0 stores the session in an encrypted cookie. The name differs by environment:
// - Vercel: '__session' (Vercel requires cookies to be prefixed with '__')
// - Local dev: 'appSession' (Auth0 SDK default)
// We check both so the session gate works in all environments.
const AUTH0_SESSION_COOKIES = ['__session', 'appSession'];

// The only origin allowed to make API requests.
// Same-origin requests (your React frontend → your Next.js API) include this
// header. Cross-origin requests from other sites include THEIR origin.
const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// ============================================================================
// CORS: Cross-Origin Resource Sharing
//
// HOW THE ATTACK WORKS:
// Without CORS protection, any website can make requests to your API using
// your user's browser. Imagine a user is logged into repliably.com. They
// visit evil-site.com. That site runs:
//
//   fetch('https://repliably.com/api/contacts', { credentials: 'include' })
//
// The browser sends the request WITH the user's auth cookies (because the
// cookies belong to repliably.com). Your API sees a valid session and returns
// all the user's contacts to evil-site.com.
//
// HOW CORS STOPS IT:
// Browsers enforce CORS by checking the Access-Control-Allow-Origin header on
// the response. If it doesn't match the requesting site's origin, the browser
// BLOCKS JavaScript from reading the response. For PUT/DELETE requests, the
// browser sends a "preflight" OPTIONS request first — if the server doesn't
// approve the origin, the real request never fires.
//
// By only allowing your own origin, no other website can read your API responses.
// ============================================================================

function handleCors(request: NextRequest, response: NextResponse): NextResponse {
	const origin = request.headers.get('origin');

	// Preflight: browser asks "can I make this request?" before sending
	// PUT, DELETE, or requests with custom headers like Content-Type: application/json
	if (request.method === 'OPTIONS') {
		const preflightResponse = new NextResponse(null, { status: 204 });

		if (origin === ALLOWED_ORIGIN) {
			preflightResponse.headers.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
			preflightResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
			preflightResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
			preflightResponse.headers.set('Access-Control-Allow-Credentials', 'true');
			// Cache preflight for 24 hours so browser doesn't ask again for every request
			preflightResponse.headers.set('Access-Control-Max-Age', '86400');
		}
		// If origin doesn't match → no CORS headers → browser blocks the request

		return preflightResponse;
	}

	// For actual requests: only add CORS headers if origin matches
	if (origin === ALLOWED_ORIGIN) {
		response.headers.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
		response.headers.set('Access-Control-Allow-Credentials', 'true');
	}

	return response;
}

// ============================================================================
// MAIN PROXY FUNCTION
// ============================================================================

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// --- CORS for API routes ---
	if (pathname.startsWith('/api/')) {
		// Skip CORS for routes that receive external requests (webhooks, cron, auth callbacks).
		// These use their own auth (Bearer tokens, secret headers) — not browser cookies.
		const externalRoutes = ['/api/webhook', '/api/cron', '/api/auth/'];
		const isExternalRoute = externalRoutes.some((route) => pathname.startsWith(route));

		if (!isExternalRoute) {
			if (request.method === 'OPTIONS') {
				return handleCors(request, NextResponse.next());
			}

			// Run Auth0 middleware first (handles session refresh, etc.)
			const auth0Response = await auth0.middleware(request);
			return handleCors(request, auth0Response);
		}

		// External routes still go through Auth0 middleware
		return await auth0.middleware(request);
	}

	// --- Session gate for /dashboard routes ---
	// Fast check: if no session cookie exists, user is definitely not logged in.
	// Redirect immediately instead of loading the page → calling getApiUser() → 401 → redirect.
	// If the cookie exists but is invalid, getApiUser() in the route handler catches it.
	if (pathname.startsWith('/dashboard')) {
		const hasSession = AUTH0_SESSION_COOKIES.some(
			(name) => request.cookies.get(name),
		);

		if (!hasSession) {
			const loginUrl = new URL('/', request.url);
			return NextResponse.redirect(loginUrl);
		}
	}

	// All other routes: just run Auth0's middleware (handles /auth/* routes, session refresh)
	return await auth0.middleware(request);
}

export const config = {
	matcher: [
		// Match everything except static files and metadata
		'/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
	],
};
