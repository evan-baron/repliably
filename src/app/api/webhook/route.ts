import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getApiUser } from '@/services/getUserService';
import { decrypt } from '@/lib/encryption';
import { processMessage } from '@/lib/helpers/checkReplies';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

export async function POST(req: NextRequest) {
	console.log(
		'Incoming webhook Authorization:',
		req.headers.get('authorization'),
	);

	try {
		const body = await req.json();
		console.log('Gmail webhook received:', body);

		// Decode the Pub/Sub message
		const message = JSON.parse(
			Buffer.from(body.message.data, 'base64').toString(),
		);

		console.log('Decoded message:', message);

		// Check for new emails
		await checkForNewEmails(message.historyId);

		return NextResponse.json({ success: true });
	} catch (error: any) {
		console.error('Webhook error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

async function checkForNewEmails(historyId: string) {
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

	const oAuth2Client = new google.auth.OAuth2(
		CLIENT_ID,
		CLIENT_SECRET,
		REDIRECT_URI,
	);
	oAuth2Client.setCredentials({ refresh_token: refreshToken });
	const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

	try {
		// Use historyId to get only NEW changes (much more efficient)
		const historyResponse = await gmail.users.history.list({
			userId: 'me',
			startHistoryId: historyId,
			historyTypes: ['messageAdded'], // Only new messages
		});

		if (historyResponse.data.history) {
			for (const historyItem of historyResponse.data.history) {
				if (historyItem.messagesAdded) {
					for (const messageAdded of historyItem.messagesAdded) {
						await processMessage(gmail, messageAdded.message!.id!);
					}
				}
			}
		}
	} catch (error) {
		console.error('Error checking emails:', error);
		// Fallback to recent messages if history fails
		await fallbackToRecentMessages(gmail);
	}
}

// Fallback method (your original approach)
async function fallbackToRecentMessages(gmail: any) {
	const response = await gmail.users.messages.list({
		userId: 'me',
		q: 'in:inbox',
		maxResults: 10,
	});

	if (response.data.messages) {
		for (const message of response.data.messages) {
			await processMessage(gmail, message.id!);
		}
	}
}
