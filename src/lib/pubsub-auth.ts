import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';

const GOOGLE_JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const GOOGLE_ISSUER = 'https://accounts.google.com';

const PUBSUB_AUDIENCE = process.env.PUBSUB_VERIFICATION_AUDIENCE;
const PUBSUB_SERVICE_ACCOUNT_EMAIL = process.env.PUBSUB_SERVICE_ACCOUNT_EMAIL;

// Cache the JWKS for performance
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJWKS() {
	if (!jwks) {
		jwks = createRemoteJWKSet(new URL(GOOGLE_JWKS_URL));
	}
	return jwks;
}

export interface PubSubTokenPayload extends JWTPayload {
	email?: string;
	email_verified?: boolean;
}

export interface VerifyResult {
	valid: boolean;
	payload?: PubSubTokenPayload;
	error?: string;
}

/**
 * Verifies a Google Pub/Sub OIDC token from the Authorization header.
 * Returns { valid: true, payload } on success, or { valid: false, error } on failure.
 */
export async function verifyPubSubToken(
	authorizationHeader: string | null
): Promise<VerifyResult> {
	// Check if environment variables are configured
	if (!PUBSUB_AUDIENCE || !PUBSUB_SERVICE_ACCOUNT_EMAIL) {
		console.error(
			'Pub/Sub auth not configured: missing PUBSUB_VERIFICATION_AUDIENCE or PUBSUB_SERVICE_ACCOUNT_EMAIL'
		);
		return {
			valid: false,
			error: 'Webhook authentication not configured',
		};
	}

	// Check for Authorization header
	if (!authorizationHeader) {
		return {
			valid: false,
			error: 'Missing Authorization header',
		};
	}

	// Extract Bearer token
	const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
	if (!match) {
		return {
			valid: false,
			error: 'Invalid Authorization header format',
		};
	}

	const token = match[1];

	try {
		// Verify the JWT against Google's public keys
		const { payload } = await jwtVerify(token, getJWKS(), {
			issuer: GOOGLE_ISSUER,
			audience: PUBSUB_AUDIENCE,
		});

		const typedPayload = payload as PubSubTokenPayload;

		// Verify the email matches the expected service account
		if (typedPayload.email !== PUBSUB_SERVICE_ACCOUNT_EMAIL) {
			return {
				valid: false,
				error: `Token email mismatch: expected ${PUBSUB_SERVICE_ACCOUNT_EMAIL}, got ${typedPayload.email}`,
			};
		}

		// Optionally verify email is verified
		if (typedPayload.email_verified === false) {
			return {
				valid: false,
				error: 'Token email not verified',
			};
		}

		return {
			valid: true,
			payload: typedPayload,
		};
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Unknown verification error';
		return {
			valid: false,
			error: `Token verification failed: ${message}`,
		};
	}
}
