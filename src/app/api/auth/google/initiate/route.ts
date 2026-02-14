import { NextRequest, NextResponse } from 'next/server';
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

		// Generate OAuth URL
		const authUrl = oauth2Client.generateAuthUrl({
			access_type: 'offline', // Required to get refresh token
			scope: SCOPES,
			prompt: 'consent', // Force consent screen to ensure we get refresh_token
			state: user.id.toString(), // Pass user ID to verify in callback
		});

		// Redirect user to Google's OAuth consent screen
		return NextResponse.redirect(authUrl);
	} catch (error) {
		console.error('OAuth initiate error:', error);
		return NextResponse.json(
			{ error: 'Failed to initiate OAuth flow' },
			{ status: 500 },
		);
	}
}
