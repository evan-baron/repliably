import { google, Auth } from 'googleapis';
import { prisma } from './prisma';
import { encrypt, decrypt, isEncryptionConfigured } from './encryption';

const SCOPES = [
	'https://www.googleapis.com/auth/gmail.send',
	'https://www.googleapis.com/auth/gmail.readonly',
	'https://www.googleapis.com/auth/gmail.modify',
	'https://www.googleapis.com/auth/userinfo.email',
];

/**
 * Creates a new OAuth2 client instance
 */
export function getOAuth2Client(): Auth.OAuth2Client {
	const clientId = process.env.GOOGLE_CLIENT_ID;
	const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
	const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
	const redirectUri = `${baseUrl}/api/google/callback`;

	if (!clientId || !clientSecret) {
		throw new Error('Google OAuth credentials not configured');
	}

	return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Generates the Google OAuth consent screen URL
 * @param state - CSRF token to verify callback
 */
export function generateAuthUrl(state: string): string {
	const client = getOAuth2Client();

	return client.generateAuthUrl({
		access_type: 'offline',
		scope: SCOPES,
		state,
		prompt: 'consent', // Force consent to get refresh token
		include_granted_scopes: true,
	});
}

/**
 * Exchanges an authorization code for access and refresh tokens
 * @param code - The authorization code from Google callback
 */
export async function exchangeCodeForTokens(code: string): Promise<{
	accessToken: string;
	refreshToken: string;
	expiryDate: Date;
	email: string;
}> {
	const client = getOAuth2Client();

	const { tokens } = await client.getToken(code);

	if (!tokens.access_token || !tokens.refresh_token) {
		throw new Error('Failed to obtain tokens from Google');
	}

	// Get user email using the access token
	client.setCredentials(tokens);
	const oauth2 = google.oauth2({ version: 'v2', auth: client });
	const userInfo = await oauth2.userinfo.get();

	if (!userInfo.data.email) {
		throw new Error('Failed to get email from Google');
	}

	const expiryDate = tokens.expiry_date
		? new Date(tokens.expiry_date)
		: new Date(Date.now() + 3600 * 1000); // Default 1 hour

	return {
		accessToken: tokens.access_token,
		refreshToken: tokens.refresh_token,
		expiryDate,
		email: userInfo.data.email,
	};
}

/**
 * Refreshes an expired access token using the refresh token
 * @param refreshToken - The encrypted refresh token
 * @returns New access token and expiry date
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
	accessToken: string;
	expiryDate: Date;
}> {
	const client = getOAuth2Client();

	// Decrypt the refresh token if encryption is configured
	const decryptedRefreshToken = isEncryptionConfigured()
		? decrypt(refreshToken)
		: refreshToken;

	client.setCredentials({ refresh_token: decryptedRefreshToken });

	const { credentials } = await client.refreshAccessToken();

	if (!credentials.access_token) {
		throw new Error('Failed to refresh access token');
	}

	const expiryDate = credentials.expiry_date
		? new Date(credentials.expiry_date)
		: new Date(Date.now() + 3600 * 1000);

	return {
		accessToken: credentials.access_token,
		expiryDate,
	};
}

/**
 * Revokes Google OAuth tokens
 * @param accessToken - The access token to revoke
 */
export async function revokeTokens(accessToken: string): Promise<void> {
	const client = getOAuth2Client();
	await client.revokeToken(accessToken);
}

/**
 * Stores OAuth tokens for a user (encrypted)
 */
export async function storeUserTokens(
	userId: number,
	tokens: {
		accessToken: string;
		refreshToken: string;
		expiryDate: Date;
		email: string;
	}
): Promise<void> {
	const encryptedAccessToken = isEncryptionConfigured()
		? encrypt(tokens.accessToken)
		: tokens.accessToken;

	const encryptedRefreshToken = isEncryptionConfigured()
		? encrypt(tokens.refreshToken)
		: tokens.refreshToken;

	await prisma.user.update({
		where: { id: userId },
		data: {
			googleEmail: tokens.email,
			googleAccessToken: encryptedAccessToken,
			googleRefreshToken: encryptedRefreshToken,
			googleTokenExpiry: tokens.expiryDate,
			gmailConnected: true,
			gmailConnectedAt: new Date(),
		},
	});
}

/**
 * Clears OAuth tokens for a user
 */
export async function clearUserTokens(userId: number): Promise<void> {
	await prisma.user.update({
		where: { id: userId },
		data: {
			googleEmail: null,
			googleAccessToken: null,
			googleRefreshToken: null,
			googleTokenExpiry: null,
			gmailConnected: false,
			gmailConnectedAt: null,
		},
	});
}

/**
 * Gets the Gmail connection status for a user
 */
export async function getGmailConnectionStatus(userId: number): Promise<{
	connected: boolean;
	email: string | null;
	connectedAt: Date | null;
}> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			gmailConnected: true,
			googleEmail: true,
			gmailConnectedAt: true,
		},
	});

	if (!user) {
		return { connected: false, email: null, connectedAt: null };
	}

	return {
		connected: user.gmailConnected,
		email: user.googleEmail,
		connectedAt: user.gmailConnectedAt,
	};
}
