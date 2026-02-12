import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { checkForReplies } from '@/lib/helpers/checkReplies';
import { getApiUser } from '@/services/getUserService';
import { decrypt } from '@/lib/encryption';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN!;

export async function POST(req: NextRequest) {
	const { user, error: authError } = await getApiUser();
	if (authError || !user) {
		return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
	}

	if (!user.emailConnectionActive || !user.gmailRefreshToken) {
		throw new Error(
			'Gmail account not connected. Please connect your Gmail account in settings.',
		);
	}

	// Decrypt the refresh token
	const refreshToken = decrypt(user.gmailRefreshToken);

	try {
		console.log('Checking for new email replies...');

		const oAuth2Client = new google.auth.OAuth2(
			CLIENT_ID,
			CLIENT_SECRET,
			REDIRECT_URI,
		);
		oAuth2Client.setCredentials({ refresh_token: refreshToken });
		const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

		console.log('Gmail client initialized, checking for replies...');

		await checkForReplies(gmail);

		return NextResponse.json({
			success: true,
			message: 'Checked for replies successfully',
		});
	} catch (error: any) {
		console.error('Error checking for replies:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
