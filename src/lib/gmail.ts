import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN!;
const SENDER_EMAIL = process.env.EMAIL_ADDRESS!;

/**
 * Get an OAuth2 client configured with a specific user's credentials
 * @param userId - The user's database ID
 * @returns Configured OAuth2Client
 */
export const getUserOAuth2Client = async (userId: number) => {
	// Fetch user's encrypted refresh token from database
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			gmailRefreshToken: true,
			connectedEmail: true,
			emailConnectionActive: true,
		},
	});

	if (!user) {
		throw new Error('User not found');
	}

	if (!user.emailConnectionActive || !user.gmailRefreshToken) {
		throw new Error(
			'Gmail account not connected. Please connect your Gmail account in settings.',
		);
	}

	// Decrypt the refresh token
	const refreshToken = decrypt(user.gmailRefreshToken);

	// Create a new OAuth2 client for this user
	const userOAuth2Client = new google.auth.OAuth2(
		process.env.GOOGLE_CLIENT_ID,
		process.env.GOOGLE_CLIENT_SECRET,
		process.env.NEXT_PUBLIC_APP_URL + '/api/auth/google/callback',
	);

	// Set the user's credentials
	userOAuth2Client.setCredentials({
		refresh_token: refreshToken,
	});

	return userOAuth2Client;
};

/**
 * Send an email using Gmail API with user's own credentials
 * @param userId - The user's database ID
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param message - Email body (HTML)
 * @param fromName - Optional sender name
 */
export async function sendGmail({
	userId,
	to,
	subject,
	text,
	html,
	inReplyTo,
	references,
	threadId,
}: {
	userId: number;
	to: string;
	subject: string;
	text?: string;
	html?: string;
	// Optional threading headers / thread id for replies
	inReplyTo?: string; // original message-id (e.g. <abc@google.com>)
	references?: string[]; // list of message-ids to include in References header
	threadId?: string; // Gmail threadId to explicitly attach to
}) {
	try {
		// // Create OAuth2 client
		// const oAuth2Client = new google.auth.OAuth2(
		// 	CLIENT_ID,
		// 	CLIENT_SECRET,
		// 	'https://developers.google.com/oauthplayground',
		// );

		const userOAuth2Client = await getUserOAuth2Client(userId);

		// // Set credentials
		// oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				connectedEmail: true,
			},
		});

		if (!user?.connectedEmail) {
			throw new Error('User email not found');
		}

		// Get Gmail API instance
		const gmail = google.gmail({ version: 'v1', auth: userOAuth2Client });
		// const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

		// Build headers for threading if provided
		const headers: string[] = [];
		headers.push(`To: ${to}`);
		headers.push(`From: ${user.connectedEmail}`);
		headers.push(`Subject: ${subject}`);
		if (inReplyTo) headers.push(`In-Reply-To: ${inReplyTo}`);
		if (references && references.length > 0)
			headers.push(`References: ${references.join(' ')}`);

		// Minimal HTML/plain multipart fallback
		headers.push('MIME-Version: 1.0');
		headers.push('Content-Type: text/html; charset=utf-8');

		const body = html || text || '';
		const emailContent = headers.join('\r\n') + '\r\n\r\n' + body;

		// Gmail API expects base64url encoding (RFC 4648 §5) - replace +/ with -_ and strip padding
		const encodedMessage = Buffer.from(emailContent)
			.toString('base64')
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=+$/, '');

		console.log('Sending email via Gmail API...');

		// Send email using Gmail API directly
		const requestBody: any = { raw: encodedMessage };
		if (threadId) requestBody.threadId = threadId;

		const result = await gmail.users.messages.send({
			userId: 'me',
			requestBody,
		});

		// Fetch metadata for the sent message to extract the RFC Message-ID header
		let messageHeaderId: string | null = null;
		try {
			const sent = await gmail.users.messages.get({
				userId: 'me',
				id: result.data.id!,
				format: 'metadata',
				metadataHeaders: ['Message-ID'],
			});
			const headers = sent.data.payload?.headers || [];
			const mid = headers.find(
				(h: any) => h.name.toLowerCase() === 'message-id',
			);
			if (mid && mid.value) messageHeaderId = mid.value;
		} catch (err) {
			console.warn('Failed to fetch sent message metadata:', err);
		}

		console.log('Email sent successfully!');
		return {
			messageId: result.data.id,
			threadId: result.data.threadId,
			data: result.data,
			messageHeaderId,
		};
	} catch (error) {
		console.error('Gmail sending error:', error);

		// Handle specific OAuth errors
		if (error instanceof Error) {
			if (
				error.message.includes('invalid_grant') ||
				error.message.includes('Token has been expired or revoked')
			) {
				// Mark user's connection as inactive
				await prisma.user.update({
					where: { id: userId },
					data: { emailConnectionActive: false },
				});
				throw new Error(
					'Gmail connection expired. Please reconnect your Gmail account in settings.',
				);
			}
		}

		throw error;
	}
}
