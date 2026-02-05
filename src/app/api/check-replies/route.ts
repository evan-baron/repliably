import { NextRequest, NextResponse } from 'next/server';
import { google, gmail_v1 } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { getGmailClient } from '@/lib/gmail';

// Legacy environment variables
const LEGACY_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const LEGACY_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const LEGACY_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const LEGACY_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

// Gmail schema types (compatible with googleapis)
type GmailHeader = gmail_v1.Schema$MessagePartHeader;

function isLegacyModeConfigured(): boolean {
	return !!(
		LEGACY_CLIENT_ID &&
		LEGACY_CLIENT_SECRET &&
		LEGACY_REDIRECT_URI &&
		LEGACY_REFRESH_TOKEN
	);
}

export async function POST(_req: NextRequest) {
	try {
		console.log('Checking for new email replies...');

		// Get all users with Gmail connected
		const connectedUsers = await prisma.user.findMany({
			where: { gmailConnected: true },
			select: { id: true, googleEmail: true },
		});

		console.log(`Found ${connectedUsers.length} users with Gmail connected`);

		// Check each connected user's inbox
		for (const user of connectedUsers) {
			try {
				console.log(
					`Checking replies for user ${user.id} (${user.googleEmail})`
				);
				const { gmail } = await getGmailClient(user.id);
				await checkForReplies(gmail, user.id);
			} catch (userError) {
				console.error(
					`Error checking replies for user ${user.id}:`,
					userError
				);
				// Continue to next user
			}
		}

		// Also check legacy account if configured and no users are connected
		if (connectedUsers.length === 0 && isLegacyModeConfigured()) {
			console.log('No connected users, using legacy Gmail configuration');
			const oAuth2Client = new google.auth.OAuth2(
				LEGACY_CLIENT_ID,
				LEGACY_CLIENT_SECRET,
				LEGACY_REDIRECT_URI
			);
			oAuth2Client.setCredentials({ refresh_token: LEGACY_REFRESH_TOKEN });
			const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
			await checkForReplies(gmail, null);
		}

		return NextResponse.json({
			success: true,
			message: 'Checked for replies successfully',
			usersChecked: connectedUsers.length,
		});
	} catch (error) {
		console.error('Error checking for replies:', error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
}

// Check for replies using a specific Gmail client
async function checkForReplies(gmail: gmail_v1.Gmail, userId: number | null) {
	console.log('Fetching recent messages from Gmail...');

	const response = await gmail.users.messages.list({
		userId: 'me',
		q: 'in:inbox',
		maxResults: 20,
	});

	if (response.data.messages) {
		console.log(
			`Found ${response.data.messages.length} recent messages to check`
		);
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

		// Extract sender email and use it for validation
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

		// Check if this is a reply to one of user's sent emails
		const sentMessage = await prisma.message.findFirst({
			where: whereClause,
			include: {
				contact: true,
			},
		});

		if (sentMessage) {
			// Validate that the reply is from the same contact user sent to
			if (senderEmail !== sentMessage.contact.email) {
				//Reply from different email than original contact, SKIP
				return;
			}

			// Check if reply already exists in DB
			const existingReply = await prisma.emailReply.findFirst({
				where: { replyMessageId: messageId },
			});

			if (existingReply) {
				const parts = message.data.payload?.parts || [];
				const textPart = parts.find((part) => part.mimeType === 'text/plain');
				if (textPart?.body?.data) {
					console.log(
						'Message already processed:',
						Buffer.from(textPart.body.data, 'base64').toString()
					);
				}

				//Reply already processed, SKIP
				return;
			}

			// Rest of processing...
			const subject = headers.find(
				(header) => header.name === 'Subject'
			)?.value;

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

			// Parse the email content into structured sections
			const parsedEmail = parseEmailContent(bodyContent);

			// Check if this is an automated/OOO reply
			const isAutoReply = isAutomatedReply(headers, subject || '', bodyContent);

			// Get sequenceId of the original sent message
			const sequenceId = sentMessage.sequenceId;

			// Store the reply
			await prisma.emailReply.create({
				data: {
					sequenceId: sequenceId,
					threadId: threadId || '',
					contactId: sentMessage.contactId,
					ownerId: sentMessage.ownerId || sentMessage.contact.ownerId, // Handle potential null
					originalMessageId: sentMessage.messageId || '',
					replyMessageId: messageId,
					replySubject: subject || 'Reply',
					replyContent: parsedEmail.reply || parsedEmail.raw,
					replyHistory: parsedEmail.history || '',
					replyDate: new Date(parseInt(message.data.internalDate || '0')),
					isAutomated: isAutoReply,
				},
			});

			console.log(
				'About to update original message and sequence...',
				sentMessage.id
			);
			// Mark original message as having reply
			await prisma.message.update({
				where: { id: sentMessage.id, threadId: threadId },
				data: { hasReply: true },
			});

			// Delete unsent messages from sequence
			await prisma.message.deleteMany({
				where: {
					contactId: sentMessage.contactId,
					sequenceId: sequenceId,
					direction: 'outbound',
					status: { in: ['scheduled', 'pending'] },
				},
			});

			// Remove from sequence ONLY if it's a real human reply (not automated)
			if (sequenceId && !isAutoReply) {
				await prisma.sequence.update({
					where: { id: sequenceId },
					data: {
						active: false,
						endDate: new Date(),
					},
				});

				// Update contact as replied
				await prisma.contact.update({
					where: { id: sentMessage.contactId },
					data: {
						replied: true,
						lastActivity: new Date(),
						active: false,
					},
				});
			} else if (isAutoReply) {
				console.log('Automated reply detected - keeping sequence active');
			}
			console.log('Message successfully processed!');
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

// Check if reply is an automated/out-of-office response
function isAutomatedReply(
	headers: GmailHeader[],
	subject: string,
	body: string
): boolean {
	// Check headers for automation indicators
	const autoSubmitted = headers.find(
		(h) => h.name?.toLowerCase() === 'auto-submitted'
	)?.value;
	const xAutorespond = headers.find(
		(h) => h.name?.toLowerCase() === 'x-autorespond'
	)?.value;
	const xAutoReply = headers.find(
		(h) => h.name?.toLowerCase() === 'x-autoreply'
	)?.value;
	const precedence = headers.find(
		(h) => h.name?.toLowerCase() === 'precedence'
	)?.value;

	// Standard auto-reply headers
	if (autoSubmitted && autoSubmitted !== 'no') return true;
	if (xAutorespond === 'yes' || xAutoReply === 'yes') return true;
	if (precedence && (precedence === 'bulk' || precedence === 'auto_reply'))
		return true;

	// Check subject line patterns (case-insensitive)
	const subjectLower = subject.toLowerCase();
	const oofSubjectPatterns = [
		'out of office',
		'automatic reply',
		'auto-reply',
		'autoreply',
		'away from office',
		'vacation',
		'i am away',
		"i'm away",
		'absence automatique',
		'automatische antwort',
	];

	if (oofSubjectPatterns.some((pattern) => subjectLower.includes(pattern)))
		return true;

	// Check body content patterns (case-insensitive)
	const bodyLower = body.toLowerCase();
	const oofBodyPatterns = [
		'out of the office',
		'currently out of office',
		'i am currently away',
		"i'm currently away",
		'automatic reply',
		'auto-reply',
		'i will be away',
		"i'll be away",
		'returning on',
		'back in the office',
		'limited access to email',
		'do not have access to my email',
	];

	if (oofBodyPatterns.some((pattern) => bodyLower.includes(pattern)))
		return true;

	return false;
}

// Interface for parsed email content
interface ParsedEmail {
	headers: string; // Mobile signatures, "From:", "Sent:" lines
	reply: string; // Actual new content
	history: string; // Quoted original email
	raw: string; // Original full content (fallback)
}

// Parse email content into structured sections
function parseEmailContent(bodyContent: string): ParsedEmail {
	const lines = bodyContent.split(/\r?\n/);

	const headerLines: string[] = [];
	const replyLines: string[] = [];
	const historyLines: string[] = [];

	let currentSection: 'headers' | 'reply' | 'history' = 'headers';

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		// Detect transitions between sections
		if (isHistoryMarker(line)) {
			currentSection = 'history';
		} else if (currentSection === 'headers' && !isMobileHeader(line)) {
			currentSection = 'reply';
		}

		// Add line to appropriate section
		if (currentSection === 'headers') headerLines.push(line);
		else if (currentSection === 'reply') replyLines.push(line);
		else historyLines.push(line);
	}

	return {
		headers: headerLines.join('\n').trim(),
		reply: replyLines.join('\n').trim(),
		history: historyLines.join('\n').trim(),
		raw: bodyContent,
	};
}

// Check if line indicates start of email history/quoted content
function isHistoryMarker(line: string): boolean {
	const trimmed = line.trim();
	return (
		/^On .+ at .+ <.+> wrote:$/i.test(trimmed) ||
		/^On .+, at .+, .+ wrote:$/i.test(trimmed) ||
		/^From:/i.test(trimmed) ||
		/^Sent:/i.test(trimmed) ||
		/^To:/i.test(trimmed) ||
		/^Subject:/i.test(trimmed) ||
		trimmed.startsWith('>') ||
		/^-+ ?Original Message ?-+/i.test(trimmed) ||
		/^-+ ?Forwarded message ?-+/i.test(trimmed) ||
		/^[-=]{10,}$/.test(trimmed)
	);
}

// Check if line is a mobile/client header (signatures, etc.)
function isMobileHeader(line: string): boolean {
	const trimmed = line.trim();
	return (
		/^Sent from my (iPhone|iPad|Android)/i.test(trimmed) ||
		/^Get Outlook for/i.test(trimmed) ||
		/^Sent from Yahoo Mail/i.test(trimmed) ||
		trimmed === '' // Allow empty lines in header section
	);
}
