import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getApiUser } from '@/services/getUserService';
import { applyRateLimit } from '@/lib/rateLimit';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';

export async function POST(req: NextRequest) {
	const { user, error: authError } = await getApiUser();
	if (authError || !user) {
		return NextResponse.json(
			{ success: false, error: 'Unauthorized' },
			{ status: 401 },
		);
	}

	const rateLimited = await applyRateLimit(user.id, 'auth-action', user.subscriptionTier);
	if (rateLimited) return rateLimited;

	const userId = user.id;

	if (!user.emailConnectionActive || !user.gmailRefreshToken) {
		return NextResponse.json(
			{ success: false, error: 'Gmail account not connected' },
			{ status: 400 },
		);
	}

	const refreshToken = decrypt(user.gmailRefreshToken);

	const oAuth2Client = new google.auth.OAuth2(
		process.env.GOOGLE_CLIENT_ID!,
		process.env.GOOGLE_CLIENT_SECRET!,
		process.env.GOOGLE_REDIRECT_URI!,
	);

	oAuth2Client.setCredentials({ refresh_token: refreshToken });

	const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

	try {
		await gmail.users.stop({ userId: 'me' });

		await prisma.user.update({
			where: { id: userId },
			data: {
				gmailWatchExpiration: null,
				gmailHistoryId: null,
				gmailWatchAllowed: false,
			},
		});

		return NextResponse.json({ success: true });
	} catch (error: any) {
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 },
		);
	}
}
