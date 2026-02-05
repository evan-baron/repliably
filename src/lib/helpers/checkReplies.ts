import { prisma } from '@/lib/prisma';

// Reuse existing processMessage function logic
export async function checkForReplies(gmail: any) {
	console.log('Fetching recent messages from Gmail...');

	const response = await gmail.users.messages.list({
		userId: 'me',
		q: 'in:inbox',
		maxResults: 20,
	});

	if (response.data.messages) {
		console.log(
			`Found ${response.data.messages.length} recent messages to check`,
		);
		for (const message of response.data.messages) {
			await processMessage(gmail, message.id!);
		}
	}
}

// Process a single Gmail message by ID (ONLY WORKS IF SENT FROM GMAIL API)
export async function processMessage(gmail: any, messageId: string) {
	try {
		const message = await gmail.users.messages.get({
			userId: 'me',
			id: messageId,
		});

		const headers = message.data.payload.headers;
		const threadId = message.data.threadId;

		// Extract sender email and use it for validation
		const from = headers.find((h: any) => h.name === 'From')?.value;

		const isBounceSenderResult = isBounceSender(
			from,
			message.data.payload.headers.find((h: any) => h.name === 'Return-Path')
				?.value,
		);

		if (isBounceSenderResult) {
			const { data } = message;

			const { threadId } = data;

			const sentMessage = await prisma.message.findFirst({
				where: {
					threadId: threadId,
					direction: 'outbound',
				},
				include: { contact: true },
			});

			if (!sentMessage) {
				return;
			}

			await prisma.contact.update({
				where: { id: sentMessage.contactId },
				data: { validEmail: false },
			});

			return;
		}

		// Extract email address from the "From" header
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
				//Reply already processed, SKIP
				return;
			}

			// Rest of processing...
			const subject = headers.find(
				(header: any) => header.name === 'Subject',
			)?.value;

			// Extract email body (simplified)
			let bodyContent = '';
			if (message.data.payload.parts) {
				const textPart = message.data.payload.parts.find(
					(part: any) => part.mimeType === 'text/plain',
				);
				if (textPart?.body?.data) {
					bodyContent = Buffer.from(textPart.body.data, 'base64').toString();
				}
			} else if (message.data.payload.body?.data) {
				bodyContent = Buffer.from(
					message.data.payload.body.data,
					'base64',
				).toString();
			}

			// Parse the email content into structured sections
			const parsedEmail = parseEmailContent(bodyContent);

			// Check if this is an automated/OOO reply
			const isAutoReply = isAutomatedReply(headers, subject || '', bodyContent);

			// Check if this message is a bounce message
			const bounceInfo = detectBounce(message.data);

			if (bounceInfo.bounced) {
				console.log(
					'Bounce detected for message:',
					messageId,
					bounceInfo.reason,
				);

				// Update contact as invalid email, deactivate sequence, etc.
				await prisma.$transaction(async (transaction) => {
					transaction.contact.update({
						where: { id: sentMessage.contactId },
						data: { validEmail: false, active: false },
					});

					transaction.sequence.updateMany({
						where: { contactId: sentMessage.contactId, active: true },
						data: { active: false, endDate: new Date() },
					});
				});
				return;
			}

			// Get sequenceId of the original sent message
			const sequenceId = sentMessage.sequenceId;

			// Store the reply
			await prisma.emailReply.create({
				data: {
					sequenceId: sequenceId,
					threadId: threadId,
					contactId: sentMessage.contactId,
					ownerId: sentMessage.ownerId || sentMessage.contact.ownerId, // Handle potential null
					originalMessageId: sentMessage.messageId || '',
					replyMessageId: messageId,
					replySubject: subject || 'Reply',
					replyContent: parsedEmail.reply || parsedEmail.raw,
					replyHistory: parsedEmail.history || '',
					replyDate: new Date(parseInt(message.data.internalDate)),
					isAutomated: isAutoReply,
				},
			});

			if (!isAutoReply) {
				await prisma.$transaction(async (transaction) => {
					// Mark original message as having reply
					await transaction.message.update({
						where: { id: sentMessage.id, threadId: threadId },
						data: { hasReply: true },
					});

					// Remove from sequence and delete unsent messages
					if (sequenceId) {
						await transaction.sequence.update({
							where: { id: sequenceId },
							data: {
								active: false,
								endDate: new Date(),
							},
						});

						// Delete unsent messages from sequence
						await transaction.message.deleteMany({
							where: {
								contactId: sentMessage.contactId,
								sequenceId: sequenceId,
								direction: 'outbound',
								status: { in: ['scheduled', 'pending'] },
							},
						});
					}

					// Update contact as replied
					await transaction.contact.update({
						where: { id: sentMessage.contactId },
						data: {
							replied: true,
							lastActivity: new Date(),
							active: false,
							validEmail: true,
						},
					});
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
export function extractEmailFromHeader(fromHeader: string): string {
	const emailMatch = fromHeader?.match(/<(.+?)>/);
	return emailMatch ? emailMatch[1] : fromHeader;
}

// Check if reply is an automated/out-of-office response
export function isAutomatedReply(
	headers: any[],
	subject: string,
	body: string,
): boolean {
	// Check headers for automation indicators
	const autoSubmitted = headers.find(
		(h: any) => h.name.toLowerCase() === 'auto-submitted',
	)?.value;
	const xAutorespond = headers.find(
		(h: any) => h.name.toLowerCase() === 'x-autorespond',
	)?.value;
	const xAutoReply = headers.find(
		(h: any) => h.name.toLowerCase() === 'x-autoreply',
	)?.value;
	const precedence = headers.find(
		(h: any) => h.name.toLowerCase() === 'precedence',
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
export function parseEmailContent(bodyContent: string): ParsedEmail {
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
export function isHistoryMarker(line: string): boolean {
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
export function isMobileHeader(line: string): boolean {
	const trimmed = line.trim();
	return (
		/^Sent from my (iPhone|iPad|Android)/i.test(trimmed) ||
		/^Get Outlook for/i.test(trimmed) ||
		/^Sent from Yahoo Mail/i.test(trimmed) ||
		trimmed === '' // Allow empty lines in header section
	);
}

// Determine if an email is a bounce message helper functions
export function decodePartBody(part: any) {
	const data = part?.body?.data;
	if (!data) return '';
	return Buffer.from(data, 'base64').toString('utf8');
}

// Find part by MIME type in email payload
export function findPartByMime(payload: any, mime: string): any | undefined {
	if (!payload) return undefined;
	if (payload.mimeType === mime) return payload;
	if (!payload.parts) return undefined;
	return payload.parts.find((p: any) => p.mimeType === mime);
}

// Analyze delivery status text for bounce indicators
export function analyzeDeliveryStatusText(text: string) {
	// RFC3464-style fields
	const statusMatch = text.match(/Status:\s*([0-9]\.[0-9]\.[0-9])/i);
	const actionMatch = text.match(/Action:\s*(\w+)/i);
	const finalRecipient = text.match(/Final-Recipient:\s*[^;]+;\s*([^\r\n]+)/i);
	return {
		status: statusMatch?.[1] ?? null,
		action: actionMatch?.[1] ?? null,
		finalRecipient: finalRecipient?.[1] ?? null,
	};
}

// Check if sender indicates a bounce message
export function isBounceSender(
	fromHeader: string | undefined,
	returnPath?: string,
) {
	const f = (fromHeader || '').toLowerCase();
	const rp = (returnPath || '').trim();

	// regex patterns to catch common bounce senders / subsystems
	const patterns = [
		/mailer-?daemon/i,
		/postmaster/i,
		/mail[ \-]?delivery/i,
		/mail-?delivery-?subsystem/i,
		/\bbounces?\b/i,
		/^bounce@/i,
		/mailer-daemon@googlemail\.com/i,
		/notifications@bounce\.amazonaws\.com/i,
	];

	if (rp === '<>' || rp === '') return true; // delivery status notification (DSN)
	return patterns.some((r) => r.test(f));
}

// Main function to detect if a message is a bounce
export function detectBounce(message: any) {
	// 1) quick header checks
	const headers = message?.payload?.headers || [];
	const from =
		headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || '';
	const autoSubmitted = headers.find(
		(h: any) => h.name.toLowerCase() === 'auto-submitted',
	)?.value;
	const xFailed = headers.find(
		(h: any) => h.name.toLowerCase() === 'x-failed-recipients',
	)?.value;

	if (/mailer-daemon|postmaster/i.test(from)) {
		return { bounced: true, reason: 'mailer-daemon sender' };
	}

	if (autoSubmitted && autoSubmitted !== 'no') {
		// auto-submitted can be auto-generated (not necessarily a bounce) — keep as automated
	}

	if (xFailed) {
		return { bounced: true, reason: `X-Failed-Recipients: ${xFailed}` };
	}

	// 2) look for message/delivery-status or multipart/report
	const dsnPart =
		findPartByMime(message.payload, 'message/delivery-status') ||
		findPartByMime(message.payload, 'multipart/report');

	if (dsnPart) {
		// sometimes delivery-status appears as a subpart
		const deliveryText =
			decodePartBody(dsnPart) ||
			(dsnPart.parts ?
				decodePartBody(
					dsnPart.parts.find(
						(p: any) => p.mimeType === 'message/delivery-status',
					),
				)
			:	'');
		const parsed = analyzeDeliveryStatusText(deliveryText);
		if (parsed.status && parsed.status.startsWith('5')) {
			return {
				bounced: true,
				reason: `DSN status ${parsed.status}`,
				status: parsed.status,
			};
		}
		if (parsed.action && /failed/i.test(parsed.action)) {
			return { bounced: true, reason: `DSN action ${parsed.action}` };
		}
	}

	// 3) fallback: scan plain/text body for bounce phrases or SMTP error codes
	const textParts =
		(message.payload.parts || [])
			.map((p: any) => decodePartBody(p))
			.join('\n\n') +
		'\n' +
		decodePartBody(message.payload);
	const text = (textParts || '').toLowerCase();
	const bounceIndicators = [
		'delivery status notification',
		'delivery has failed',
		'mail delivery failed',
		'undelivered mail returned to sender',
		'recipient address rejected',
		'user unknown',
		'550 ',
		'5.1.1',
		'recipient not found',
		'no such user',
		'mailbox unavailable',
	];

	for (const phrase of bounceIndicators) {
		if (text.includes(phrase)) {
			return { bounced: true, reason: `matched phrase: ${phrase}` };
		}
	}

	return { bounced: false };
}

export function extractOriginalMessageIdFromBounce(
	message: any,
): string | null {
	const payload = message.data?.payload ?? message.payload ?? {};

	// 1) look inside message/rfc822 (contains original headers)
	const rfcPart =
		findPartByMime(payload, 'message/rfc822') ||
		(payload.parts || []).find((p: any) => p.mimeType === 'message/rfc822');
	if (rfcPart) {
		const rfcText = decodePartBody(rfcPart);
		const midMatch = rfcText.match(/^Message-ID:\s*(<[^>]+>)/im);
		if (midMatch) return midMatch[1].replace(/[<>]/g, '').trim();
	}

	// 2) check delivery-status / multipart/report text for Original-Message-ID or Message-ID
	const dsnPart =
		findPartByMime(payload, 'message/delivery-status') ||
		findPartByMime(payload, 'multipart/report');
	if (dsnPart) {
		const text =
			decodePartBody(dsnPart) ||
			(dsnPart.parts ?
				decodePartBody(
					dsnPart.parts.find(
						(p: any) => p.mimeType === 'message/delivery-status',
					),
				)
			:	'');
		const origMatch =
			text.match(/Original-Message-ID:\s*(<[^>]+>)/i) ||
			text.match(/Message-ID:\s*(<[^>]+>)/i);
		if (origMatch) return origMatch[1].replace(/[<>]/g, '').trim();
	}

	// 3) check bounce headers (sometimes present)
	const headers = payload.headers || [];
	const headerMid =
		headers.find((h: any) => h.name.toLowerCase() === 'original-message-id')
			?.value ||
		headers.find((h: any) => h.name.toLowerCase() === 'message-id')?.value;
	if (headerMid) return headerMid.replace(/[<>]/g, '').trim();

	// 4) fallback: search body text for a Message-ID-like token enclosed in <>
	const combined =
		((payload.parts || []).map((p: any) => decodePartBody(p)).join('\n\n') ||
			'') +
		'\n' +
		decodePartBody(payload);
	const anyMid = combined.match(/<[\w.+-]+@[\w.-]+>/);
	if (anyMid) return anyMid[0].replace(/[<>]/g, '').trim();

	return null;
}
