import { NextResponse } from 'next/server';
import { generateAuthUrl } from '@/lib/googleOAuth';
import { getApiUser } from '@/services/getUserService';
import crypto from 'crypto';
import { cookies } from 'next/headers';

export async function GET() {
	try {
		const { user, error } = await getApiUser();
		if (error) {
			return NextResponse.json(
				{ error: error.error },
				{ status: error.status }
			);
		}

		// Generate CSRF token
		const state = crypto.randomBytes(32).toString('hex');

		// Store state in cookie for verification in callback
		const cookieStore = await cookies();
		cookieStore.set('google_oauth_state', state, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 600, // 10 minutes
			path: '/',
		});

		// Store user ID in cookie to retrieve in callback
		cookieStore.set('google_oauth_user_id', String(user.id), {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 600,
			path: '/',
		});

		const authUrl = generateAuthUrl(state);

		// Redirect to Google consent screen
		return NextResponse.redirect(authUrl);
	} catch (error) {
		console.error('Error initiating Google OAuth:', error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
}
