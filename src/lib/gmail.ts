import { google, gmail_v1 } from 'googleapis';
import { prisma } from './prisma';
import { decrypt, encrypt, isEncryptionConfigured } from './encryption';
import { getOAuth2Client, refreshAccessToken } from './googleOAuth';

// Legacy environment variables (for backward compatibility)
const LEGACY_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const LEGACY_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const LEGACY_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const LEGACY_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const LEGACY_SENDER_EMAIL = process.env.EMAIL_ADDRESS;

/**
 * Check if legacy (single-account) mode is configured
 */
function isLegacyModeConfigured(): boolean {
	return !!(
		LEGACY_CLIENT_ID &&
		LEGACY_CLIENT_SECRET &&
		LEGACY_REDIRECT_URI &&
		LEGACY_REFRESH_TOKEN &&
		LEGACY_SENDER_EMAIL
	);
}

/**
 * Gets a Gmail client for a specific user
 * Handles token refresh automatically
 */
export async function getGmailClient(userId: number): Promise<{
	gmail: gmail_v1.Gmail;
	senderEmail: string;
}> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			googleAccessToken: true,
			googleRefreshToken: true,
			googleTokenExpiry: true,
			googleEmail: true,
			gmailConnected: true,
		},
	});

	if (!user || !user.gmailConnected) {
		throw new Error('Gmail not connected for this user');
	}

	if (!user.googleRefreshToken || !user.googleEmail) {
		throw new Error('Gmail credentials incomplete for this user');
	}

	const oAuth2Client = getOAuth2Client();

	// Decrypt tokens
	const refreshToken = isEncryptionConfigured()
		? decrypt(user.googleRefreshToken)
		: user.googleRefreshToken;

	let accessToken = user.googleAccessToken
		? isEncryptionConfigured()
			? decrypt(user.googleAccessToken)
			: user.googleAccessToken
		: null;

	// Check if token needs refresh (within 5 minutes of expiry or expired)
	const tokenNeedsRefresh =
		!accessToken ||
		!user.googleTokenExpiry ||
		user.googleTokenExpiry.getTime() < Date.now() + 5 * 60 * 1000;

	if (tokenNeedsRefresh) {
		console.log(`Refreshing access token for user ${userId}`);

		// Need to pass the raw refresh token for refresh
		const encryptedRefreshToken = user.googleRefreshToken;
		const refreshResult = await refreshAccessToken(encryptedRefreshToken);

		accessToken = refreshResult.accessToken;

		// Update stored access token
		const encryptedAccessToken = isEncryptionConfigured()
			? encrypt(refreshResult.accessToken)
			: refreshResult.accessToken;

		await prisma.user.update({
			where: { id: userId },
			data: {
				googleAccessToken: encryptedAccessToken,
				googleTokenExpiry: refreshResult.expiryDate,
			},
		});
	}

	oAuth2Client.setCredentials({
		access_token: accessToken,
		refresh_token: refreshToken,
	});

	const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

	return { gmail, senderEmail: user.googleEmail };
}

/**
 * Gets a Gmail client using legacy environment variable configuration
 * For backward compatibility during migration
 */
function getLegacyGmailClient(): { gmail: gmail_v1.Gmail; senderEmail: string } {
	if (!isLegacyModeConfigured()) {
		throw new Error('Legacy Gmail configuration not available');
	}

	const oAuth2Client = new google.auth.OAuth2(
		LEGACY_CLIENT_ID,
		LEGACY_CLIENT_SECRET,
		LEGACY_REDIRECT_URI
	);

	oAuth2Client.setCredentials({ refresh_token: LEGACY_REFRESH_TOKEN });

	const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

	return { gmail, senderEmail: LEGACY_SENDER_EMAIL! };
}

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
	userId?: number;
	to: string;
	subject: string;
	text?: string;
	html?: string;
	inReplyTo?: string;
	references?: string[];
	threadId?: string;
}) {
	try {
		let gmail: gmail_v1.Gmail;
		let senderEmail: string;

		// Determine which mode to use
		if (userId) {
			// Multi-user mode: use per-user credentials
			const client = await getGmailClient(userId);
			gmail = client.gmail;
			senderEmail = client.senderEmail;
		} else if (isLegacyModeConfigured()) {
			// Legacy mode: use environment variable credentials
			console.log('Using legacy Gmail configuration');
			const client = getLegacyGmailClient();
			gmail = client.gmail;
			senderEmail = client.senderEmail;
		} else {
			throw new Error(
				'No Gmail credentials available. Please connect your Gmail account.'
			);
		}

		// Build headers for threading if provided
		const headers: string[] = [];
		headers.push(`To: ${to}`);
		headers.push(`From: ${senderEmail}`);
		headers.push(`Subject: ${subject}`);
		if (inReplyTo) headers.push(`In-Reply-To: ${inReplyTo}`);
		if (references && references.length > 0)
			headers.push(`References: ${references.join(' ')}`);

		// Minimal HTML/plain multipart fallback
		headers.push('MIME-Version: 1.0');
		headers.push('Content-Type: text/html; charset=utf-8');

		const body = html || text || '';
		const emailContent = headers.join('\r\n') + '\r\n\r\n' + body;

		// Gmail API expects base64url encoding (RFC 4648 §5)
		const encodedMessage = Buffer.from(emailContent)
			.toString('base64')
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=+$/, '');

		console.log(`Sending email via Gmail API from ${senderEmail}...`);

		// Send email using Gmail API directly
		const requestBody: { raw: string; threadId?: string } = { raw: encodedMessage };
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
			const msgHeaders = sent.data.payload?.headers || [];
			const mid = msgHeaders.find(
				(h) => h.name?.toLowerCase() === 'message-id'
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
			senderEmail,
		};
	} catch (error) {
		console.error('Gmail sending error:', error);
		throw error;
	}
}

/**
 * Check if a user has Gmail connected
 */
export async function isGmailConnected(userId: number): Promise<boolean> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { gmailConnected: true },
	});

	return user?.gmailConnected ?? false;
}
