import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';
import { getApiUser } from '@/services/getUserService';

const oauth2Client = new google.auth.OAuth2(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	process.env.NEXT_PUBLIC_APP_URL + '/api/auth/google/callback', // Redirect URI
);

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const code = searchParams.get('code');
		const error = searchParams.get('error');

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

		// Exchange authorization code for tokens
		const { tokens } = await oauth2Client.getToken(code);

		if (!tokens.refresh_token) {
			// This can happen if user previously authorized - Google doesn't send refresh_token again
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

		console.log(`✅ Email connected for user ${user.id}: ${gmailAddress}`);

		// Redirect back to settings with success message
		return NextResponse.redirect(
			new URL(
				'/dashboard/settings?tab=email&email=connected',
				process.env.NEXT_PUBLIC_APP_URL!,
			),
		);
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
