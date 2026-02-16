import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { google } from 'googleapis';
import { getApiUser } from '@/services/getUserService';
import { applyRateLimit } from '@/lib/rateLimit';

const oauth2Client = new google.auth.OAuth2(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	process.env.NEXT_PUBLIC_APP_URL + '/api/auth/google/callback',
);

// Scopes define what access we're requesting
const SCOPES = [
	'https://www.googleapis.com/auth/gmail.send',
	'https://www.googleapis.com/auth/gmail.modify',
	'https://www.googleapis.com/auth/gmail.compose',
	'https://www.googleapis.com/auth/userinfo.email',
];

export async function GET(request: NextRequest) {
	try {
		// Verify user is authenticated
		const { user, error } = await getApiUser();
		if (error || !user) {
			return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
		}

		const rateLimited = await applyRateLimit(user.id, 'auth-action', user.subscriptionTier);
		if (rateLimited) return rateLimited;

		// Generate a cryptographically random state token.
		// This is a nonce (number used once) — unpredictable, unique per request.
		// We store it in a short-lived cookie and send it to Google.
		// When Google redirects back, we compare the state param to the cookie.
		// If they don't match, someone tampered with the flow.
		const stateToken = crypto.randomBytes(32).toString('hex');

		// Generate OAuth URL with the random state
		const authUrl = oauth2Client.generateAuthUrl({
			access_type: 'offline',
			scope: SCOPES,
			prompt: 'consent',
			state: stateToken,
		});

		// Redirect user to Google, and set the state token as a cookie.
		// httpOnly: JavaScript can't read it (XSS protection)
		// secure: only sent over HTTPS (production)
		// sameSite: 'lax' allows the cookie to be sent on the redirect back from Google
		// maxAge: 10 minutes — plenty of time to complete OAuth, short enough to limit abuse
		const response = NextResponse.redirect(authUrl);
		response.cookies.set('oauth_state', stateToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 600,
			path: '/api/auth/google/callback',
		});

		return response;
	} catch (error) {
		console.error('OAuth initiate error:', error);
		return NextResponse.json(
			{ error: 'Failed to initiate OAuth flow' },
			{ status: 500 },
		);
	}
}
