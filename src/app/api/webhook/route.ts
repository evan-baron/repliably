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
	console.log('Received webhook with Authorization header:', authHeader);
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}
	const token = authHeader.split(' ')[1];

	// 2. Verify the JWT
	const client = new OAuth2Client();
	let payload;
	try {
		const ticket = await client.verifyIdToken({
			idToken: token,
			audience: process.env.PUBSUB_AUDIENCE,
		});
		payload = ticket.getPayload();
	} catch (err) {
		console.error('JWT verification failed:', err);
		// return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		return NextResponse.json({ success: true });
	}

	try {
		const body = await req.json();
		console.log('Gmail webhook received:', body);

		// Decode the Pub/Sub message
		const message = JSON.parse(
			Buffer.from(body.message.data, 'base64').toString(),
		);
		console.log('Decoded message:', message);

		const { emailAddress } = message;

		// Find user by email address
		const user = await prisma.user.findUnique({
			where: { email: emailAddress },
			select: { id: true, gmailRefreshToken: true, gmailHistoryId: true },
		});

		const { id, gmailRefreshToken, gmailHistoryId } = user || {};

		if (!id) {
			console.error('No user found for email:', emailAddress);
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		if (!gmailRefreshToken) {
			console.error('User does not have a Gmail refresh token:', emailAddress);
			return NextResponse.json(
				{ error: 'Gmail refresh token not found' },
				{ status: 404 },
			);
		}

		if (!gmailHistoryId) {
			console.error('User does not have a Gmail history ID:', emailAddress);
			return NextResponse.json(
				{ error: 'Gmail history ID not found' },
				{ status: 404 },
			);
		}

		// Check for new emails
		await checkForNewEmails(gmailHistoryId, gmailRefreshToken);

		return NextResponse.json({ success: true });
	} catch (error: any) {
		console.error('Webhook error:', error);
		// return NextResponse.json({ error: error.message }, { status: 500 });
		return NextResponse.json({ success: true });
	}
}

async function checkForNewEmails(historyId: string, gmailRefreshToken: string) {
	console.log('Checking for new emails with historyId:', historyId);

	if (!gmailRefreshToken) {
		console.error('User does not have a Gmail refresh token');
		return;
	}

	// Decrypt the refresh token
	const refreshToken = decrypt(gmailRefreshToken);

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

		console.log('History response:', historyResponse.data);

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
