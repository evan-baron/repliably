import { google } from 'googleapis';
import { getApiUser } from '@/services/getUserService';
import { decrypt } from '@/lib/encryption';
import { prisma } from '@/lib/prisma';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID!;

export async function setupGmailNotifications() {
	const { user, error: authError } = await getApiUser();
	if (authError || !user) {
		throw new Error('Not authenticated');
	}

	if (!user.emailConnectionActive || !user.gmailRefreshToken) {
		throw new Error(
			'Gmail account not connected. Please connect your Gmail account in settings.',
		);
	}

	// Decrypt the refresh token
	const refreshToken = decrypt(user.gmailRefreshToken);

	try {
		const oAuth2Client = new google.auth.OAuth2(
			CLIENT_ID,
			CLIENT_SECRET,
			REDIRECT_URI,
		);
		oAuth2Client.setCredentials({ refresh_token: refreshToken });

		const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

		const result = await gmail.users.watch({
			userId: 'me',
			requestBody: {
				topicName: `projects/${PROJECT_ID}/topics/gmail-notifications`,
				labelIds: ['INBOX'],
			},
		});

		await prisma.user.update({
			where: { id: user.id },
			data: {
				gmailWatchExpiration:
					result.data.expiration ?
						new Date(Number(result.data.expiration))
					:	null,
				gmailHistoryId: result.data.historyId,
			},
		});

		return result;
	} catch (error) {
		console.error('Error setting up Gmail notifications:', error);
		throw error;
	}
}
