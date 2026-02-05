import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens, storeUserTokens } from '@/lib/googleOAuth';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
	try {
		const searchParams = req.nextUrl.searchParams;
		const code = searchParams.get('code');
		const state = searchParams.get('state');
		const error = searchParams.get('error');

		const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';

		// Handle errors from Google
		if (error) {
			console.error('Google OAuth error:', error);
			return NextResponse.redirect(
				`${baseUrl}/dashboard/settings?gmail_error=${encodeURIComponent(error)}`
			);
		}

		if (!code || !state) {
			return NextResponse.redirect(
				`${baseUrl}/dashboard/settings?gmail_error=missing_params`
			);
		}

		// Verify CSRF token
		const cookieStore = await cookies();
		const storedState = cookieStore.get('google_oauth_state')?.value;
		const userIdString = cookieStore.get('google_oauth_user_id')?.value;

		if (!storedState || state !== storedState) {
			return NextResponse.redirect(
				`${baseUrl}/dashboard/settings?gmail_error=invalid_state`
			);
		}

		if (!userIdString) {
			return NextResponse.redirect(
				`${baseUrl}/dashboard/settings?gmail_error=session_expired`
			);
		}

		const userId = parseInt(userIdString, 10);

		// Exchange code for tokens
		const tokens = await exchangeCodeForTokens(code);

		// Store tokens for user
		await storeUserTokens(userId, tokens);

		// Clear OAuth cookies
		cookieStore.delete('google_oauth_state');
		cookieStore.delete('google_oauth_user_id');

		// Redirect to settings with success message
		return NextResponse.redirect(
			`${baseUrl}/dashboard/settings?gmail_connected=true`
		);
	} catch (error) {
		console.error('Error in Google OAuth callback:', error);
		const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
		return NextResponse.redirect(
			`${baseUrl}/dashboard/settings?gmail_error=${encodeURIComponent(
				error instanceof Error ? error.message : 'Unknown error'
			)}`
		);
	}
}
