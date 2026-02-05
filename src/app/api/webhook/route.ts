import { NextRequest, NextResponse } from 'next/server';
import { google, gmail_v1 } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { getGmailClient } from '@/lib/gmail';

// Legacy environment variables
const LEGACY_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const LEGACY_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const LEGACY_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const LEGACY_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

function isLegacyModeConfigured(): boolean {
	return !!(
		LEGACY_CLIENT_ID &&
		LEGACY_CLIENT_SECRET &&
		LEGACY_REDIRECT_URI &&
		LEGACY_REFRESH_TOKEN
	);
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		console.log('Gmail webhook received:', body);

		// Decode the Pub/Sub message
		const message = JSON.parse(
			Buffer.from(body.message.data, 'base64').toString()
		);

		console.log('Decoded message:', message);

		// The emailAddress in the notification tells us which inbox received the email
		const notificationEmail = message.emailAddress;

		// Check for new emails
		await checkForNewEmails(message.historyId, notificationEmail);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Webhook error:', error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
}

async function checkForNewEmails(
	historyId: string,
	notificationEmail?: string
) {
	let gmail: gmail_v1.Gmail;
	let userId: number | null = null;

	// Try to find the user by their googleEmail
	if (notificationEmail) {
		const user = await prisma.user.findFirst({
			where: {
				googleEmail: notificationEmail,
				gmailConnected: true,
			},
			select: { id: true },
		});

		if (user) {
			userId = user.id;
			const client = await getGmailClient(user.id);
			gmail = client.gmail;
			console.log(
				`Using credentials for user ${user.id} (${notificationEmail})`
			);
		} else if (isLegacyModeConfigured()) {
			// Fall back to legacy mode
			console.log('User not found, using legacy Gmail configuration');
			const oAuth2Client = new google.auth.OAuth2(
				LEGACY_CLIENT_ID,
				LEGACY_CLIENT_SECRET,
				LEGACY_REDIRECT_URI
			);
			oAuth2Client.setCredentials({ refresh_token: LEGACY_REFRESH_TOKEN });
			gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
		} else {
			console.error(`No credentials found for email: ${notificationEmail}`);
			return;
		}
	} else if (isLegacyModeConfigured()) {
		// No email in notification, use legacy mode
		const oAuth2Client = new google.auth.OAuth2(
			LEGACY_CLIENT_ID,
			LEGACY_CLIENT_SECRET,
			LEGACY_REDIRECT_URI
		);
		oAuth2Client.setCredentials({ refresh_token: LEGACY_REFRESH_TOKEN });
		gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
	} else {
		console.error('No Gmail credentials available for webhook processing');
		return;
	}

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
						await processMessage(gmail, messageAdded.message!.id!, userId);
					}
				}
			}
		}
	} catch (error) {
		console.error('Error checking emails:', error);
		// Fallback to recent messages if history fails
		await fallbackToRecentMessages(gmail, userId);
	}
}

// Fallback method (your original approach)
async function fallbackToRecentMessages(
	gmail: gmail_v1.Gmail,
	userId: number | null
) {
	const response = await gmail.users.messages.list({
		userId: 'me',
		q: 'in:inbox',
		maxResults: 10,
	});

	if (response.data.messages) {
		for (const message of response.data.messages) {
			await processMessage(gmail, message.id!, userId);
		}
	}
}

async function processMessage(
	gmail: gmail_v1.Gmail,
	messageId: string,
	checkingUserId: number | null
) {
	try {
		const message = await gmail.users.messages.get({
			userId: 'me',
			id: messageId,
		});

		const headers = message.data.payload?.headers || [];
		const threadId = message.data.threadId;

		// Extract sender email and USE it for validation
		const from = headers.find((h) => h.name === 'From')?.value;
		const senderEmail = extractEmailFromHeader(from || '');

		// Build query for finding sent message
		// If checking a specific user's inbox, only match their messages
		const whereClause: {
			threadId: string | null | undefined;
			direction: string;
			ownerId?: number;
		} = {
			threadId: threadId,
			direction: 'outbound',
		};

		if (checkingUserId !== null) {
			whereClause.ownerId = checkingUserId;
		}

		// Check if this is a reply to one of our sent emails
		const sentMessage = await prisma.message.findFirst({
			where: whereClause,
			include: {
				contact: true,
			},
		});

		if (sentMessage) {
			// Validate that the reply is from the same contact we sent to
			if (senderEmail !== sentMessage.contact.email) {
				console.log(
					'Reply from different email than original contact, skipping'
				);
				return;
			}

			// Rest of processing...
			const subject = headers.find((h) => h.name === 'Subject')?.value;

			// Extract email body (simplified)
			let bodyContent = '';
			const payload = message.data.payload;
			if (payload?.parts) {
				const textPart = payload.parts.find(
					(part) => part.mimeType === 'text/plain'
				);
				if (textPart?.body?.data) {
					bodyContent = Buffer.from(textPart.body.data, 'base64').toString();
				}
			} else if (payload?.body?.data) {
				bodyContent = Buffer.from(payload.body.data, 'base64').toString();
			}

			// Store the reply
			await prisma.message.create({
				data: {
					contactId: sentMessage.contactId,
					ownerId: sentMessage.ownerId,
					subject: subject || 'Reply',
					contents: bodyContent,
					direction: 'inbound',
					messageId: messageId,
					threadId: threadId,
					createdAt: new Date(parseInt(message.data.internalDate || '0')),
				},
			});

			// Update contact as replied
			await prisma.contact.update({
				where: { id: sentMessage.contactId },
				data: {
					replied: true,
					lastActivity: new Date(),
				},
			});

			// Mark original message as having reply
			await prisma.message.update({
				where: { id: sentMessage.id },
				data: { hasReply: true },
			});

			console.log(
				'Reply processed from:',
				senderEmail,
				'for contact:',
				sentMessage.contact.email
			);
		}
	} catch (error) {
		console.error('Error processing message:', error);
	}
}

// Helper function to extract email from "Name <email@domain.com>" format
function extractEmailFromHeader(fromHeader: string): string {
	const emailMatch = fromHeader?.match(/<(.+?)>/);
	return emailMatch ? emailMatch[1] : fromHeader;
}
