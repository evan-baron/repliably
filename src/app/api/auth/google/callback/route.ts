import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';
import { getApiUser } from '@/services/getUserService';
import { applyRateLimit } from '@/lib/rateLimit';

const oauth2Client = new google.auth.OAuth2(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	process.env.NEXT_PUBLIC_APP_URL + '/api/auth/google/callback',
);

// Timing-safe comparison for the state token — same principle as the cron
// secret check. Prevents an attacker from guessing the state value through
// timing differences.
function verifyState(provided: string, expected: string): boolean {
	const a = Buffer.from(provided);
	const b = Buffer.from(expected);

	if (a.length !== b.length) {
		crypto.timingSafeEqual(b, b);
		return false;
	}

	return crypto.timingSafeEqual(a, b);
}

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const code = searchParams.get('code');
		const error = searchParams.get('error');
		const state = searchParams.get('state');

		// Handle user denial
		if (error) {
			console.error('OAuth error:', error);
			return NextResponse.redirect(
				new URL(
					'/dashboard/settings?tab=email&error=access_denied',
					process.env.NEXT_PUBLIC_APP_URL!,
				),
			);
		}

		// Validate authorization code
		if (!code) {
			return NextResponse.redirect(
				new URL(
					'/dashboard/settings?tab=email&error=no_code',
					process.env.NEXT_PUBLIC_APP_URL!,
				),
			);
		}

		// --- State validation ---
		// Check that the state parameter from Google matches the cookie we set
		// during initiate. If they don't match, this request didn't originate
		// from our OAuth flow — it could be a CSRF attack where someone is
		// trying to link THEIR Gmail to the victim's account.
		const storedState = request.cookies.get('oauth_state')?.value;

		if (!state || !storedState || !verifyState(state, storedState)) {
			console.warn('OAuth state mismatch — possible CSRF attempt');
			return NextResponse.redirect(
				new URL(
					'/dashboard/settings?tab=email&error=invalid_state',
					process.env.NEXT_PUBLIC_APP_URL!,
				),
			);
		}

		// Get the authenticated user
		const { user, error: authError } = await getApiUser();
		if (authError || !user) {
			return NextResponse.redirect(
				new URL(
					'/dashboard/settings?tab=email&error=not_authenticated',
					process.env.NEXT_PUBLIC_APP_URL!,
				),
			);
		}

		const rateLimited = await applyRateLimit(user.id, 'auth-action', user.subscriptionTier);
		if (rateLimited) return rateLimited;

		// Exchange authorization code for tokens
		const { tokens } = await oauth2Client.getToken(code);

		if (!tokens.refresh_token) {
			return NextResponse.redirect(
				new URL(
					'/dashboard/settings?tab=email&error=no_refresh_token',
					process.env.NEXT_PUBLIC_APP_URL!,
				),
			);
		}

		// Set credentials to get user info
		oauth2Client.setCredentials(tokens);

		// Get user's Gmail address
		const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
		const userInfo = await oauth2.userinfo.get();
		const gmailAddress = userInfo.data.email;

		if (!gmailAddress) {
			return NextResponse.redirect(
				new URL(
					'/dashboard/settings?tab=email&error=no_email',
					process.env.NEXT_PUBLIC_APP_URL!,
				),
			);
		}

		// Encrypt the refresh token before storing
		const encryptedToken = encrypt(tokens.refresh_token);

		// Store in database
		await prisma.user.update({
			where: { id: user.id },
			data: {
				gmailRefreshToken: encryptedToken,
				connectedEmail: gmailAddress,
				emailConnectedAt: new Date(),
				emailConnectionActive: true,
				emailTokenExpiresAt:
					tokens.expiry_date ? new Date(tokens.expiry_date) : null,
			},
		});

		// Redirect back to settings with success message.
		// Also clear the oauth_state cookie — it's single-use.
		const successResponse = NextResponse.redirect(
			new URL(
				'/dashboard/settings?tab=email&email=connected',
				process.env.NEXT_PUBLIC_APP_URL!,
			),
		);
		successResponse.cookies.delete('oauth_state');

		return successResponse;
	} catch (error) {
		console.error('OAuth callback error:', error);
		return NextResponse.redirect(
			new URL(
				'/dashboard/settings?tab=email&error=connection_failed',
				process.env.NEXT_PUBLIC_APP_URL!,
			),
		);
	}
}
