import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { decrypt } from '@/lib/encryption';
import { processMessage } from '@/lib/helpers/checkReplies';
import { prisma } from '@/lib/prisma';
import { OAuth2Client } from 'google-auth-library';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

export async function POST(req: NextRequest) {
	// 1. Get the Authorization header
	const authHeader = req.headers.get('authorization');

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}
	const token = authHeader.split(' ')[1];

	// 2. Verify the JWT
	const client = new OAuth2Client();

	try {
		await client.verifyIdToken({
			idToken: token,
			audience: process.env.PUBSUB_AUDIENCE,
		});
	} catch (err) {
		console.error('JWT verification failed:', err);
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const body = await req.json();

		// Decode the Pub/Sub message
		const message = JSON.parse(
			Buffer.from(body.message.data, 'base64').toString(),
		);

		const { emailAddress } = message;

		// Find user by email address
		const user = await prisma.user.findUnique({
			where: { email: emailAddress },
			select: { id: true, gmailRefreshToken: true, gmailHistoryId: true },
		});

		const { id, gmailRefreshToken, gmailHistoryId } = user || {};

		if (!id) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		if (!gmailRefreshToken) {
			return NextResponse.json(
				{ error: 'Gmail refresh token not found' },
				{ status: 404 },
			);
		}

		if (!gmailHistoryId) {
			return NextResponse.json(
				{ error: 'Gmail history ID not found' },
				{ status: 404 },
			);
		}

		// Check for new emails
		await checkForNewEmails(gmailHistoryId, gmailRefreshToken);

		// Update historyId in database (to avoid reprocessing same emails)
		const newHistoryId = message.historyId;

		await prisma.user.update({
			where: { id },
			data: { gmailHistoryId: String(newHistoryId) },
		});

		return NextResponse.json({ success: true });
	} catch (error: any) {
		console.error('Webhook error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

async function checkForNewEmails(historyId: string, gmailRefreshToken: string) {
	// Decrypt the refresh token
	const refreshToken = decrypt(gmailRefreshToken);

	const oAuth2Client = new google.auth.OAuth2(
		CLIENT_ID,
		CLIENT_SECRET,
		REDIRECT_URI,
	);
	oAuth2Client.setCredentials({ refresh_token: refreshToken });
	const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

	const MAX_EMAILS_TO_PROCESS = 20;
	let processed = 0;

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
						processed++;
					}
				}
				if (processed >= MAX_EMAILS_TO_PROCESS) break;
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
	const MAX_EMAILS_TO_PROCESS = 20;
	const response = await gmail.users.messages.list({
		userId: 'me',
		q: 'in:inbox',
		maxResults: MAX_EMAILS_TO_PROCESS,
	});

	if (response.data.messages) {
		for (const message of response.data.messages) {
			await processMessage(gmail, message.id!);
		}
	}
}
