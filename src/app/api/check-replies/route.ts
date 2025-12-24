import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN!;

export async function POST(req: NextRequest) {
	try {
		console.log('Checking for new email replies...');

		const oAuth2Client = new google.auth.OAuth2(
			CLIENT_ID,
			CLIENT_SECRET,
			REDIRECT_URI
		);
		oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
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

// Reuse existing processMessage function logic
async function checkForReplies(gmail: any) {
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
			await processMessage(gmail, message.id!);
		}
	}
}

async function processMessage(gmail: any, messageId: string) {
	try {
		const message = await gmail.users.messages.get({
			userId: 'me',
			id: messageId,
		});

		const headers = message.data.payload.headers;
		const threadId = message.data.threadId;

		// Extract sender email and use it for validation
		const from = headers.find((h: any) => h.name === 'From')?.value;
		const senderEmail = extractEmailFromHeader(from);

		// Check if this is a reply to one of user's sent emails
		const sentMessage = await prisma.message.findFirst({
			where: {
				threadId: threadId,
				direction: 'outbound',
			},
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
				console.log(
					'Message:',
					Buffer.from(
						message.data.payload.parts.find(
							(part: any) => part.mimeType === 'text/plain'
						).body.data,
						'base64'
					).toString()
				);

				//Reply already processed, SKIP
				return;
			}

			// Rest of processing...
			const subject = headers.find((h: any) => h.name === 'Subject')?.value;

			// Extract email body (simplified)
			let bodyContent = '';
			if (message.data.payload.parts) {
				const textPart = message.data.payload.parts.find(
					(part: any) => part.mimeType === 'text/plain'
				);
				if (textPart?.body?.data) {
					bodyContent = Buffer.from(textPart.body.data, 'base64').toString();
				}
			} else if (message.data.payload.body?.data) {
				bodyContent = Buffer.from(
					message.data.payload.body.data,
					'base64'
				).toString();
			}

			// Parse the email content into structured sections
			const parsedEmail = parseEmailContent(bodyContent);

			// Store the reply
			await prisma.emailReply.create({
				data: {
					contactId: sentMessage.contactId,
					ownerId: sentMessage.ownerId || sentMessage.contact.ownerId, // Handle potential null
					originalMessageId: sentMessage.messageId || '',
					replyMessageId: messageId,
					replySubject: subject || 'Reply',
					replyContent: parsedEmail.reply || parsedEmail.raw,
					replyHistory: parsedEmail.history || '',
					replyDate: new Date(parseInt(message.data.internalDate)),
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

			///////////////////////////////////////////////////////////////////////////////////
			//                                                                               //
			//                          REMOVE FROM CADENCE LOGIC                            //
			//                                                                               //
			///////////////////////////////////////////////////////////////////////////////////
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

	let headerLines: string[] = [];
	let replyLines: string[] = [];
	let historyLines: string[] = [];

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
