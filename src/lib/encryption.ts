import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

function getEncryptionKey(): Buffer {
	const key = process.env.TOKEN_ENCRYPTION_KEY;
	if (!key) {
		throw new Error('TOKEN_ENCRYPTION_KEY environment variable is not set');
	}
	// Key should be 32 bytes (64 hex characters)
	if (key.length !== 64) {
		throw new Error(
			'TOKEN_ENCRYPTION_KEY must be 64 hex characters (32 bytes)'
		);
	}
	return Buffer.from(key, 'hex');
}

/**
 * Encrypts a string using AES-256-CBC
 * @param text - The plaintext to encrypt
 * @returns The encrypted text as a hex string (iv:encrypted)
 */
export function encrypt(text: string): string {
	const key = getEncryptionKey();
	const iv = crypto.randomBytes(IV_LENGTH);
	const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

	let encrypted = cipher.update(text, 'utf8', 'hex');
	encrypted += cipher.final('hex');

	// Return iv:encrypted format
	return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts a string encrypted with encrypt()
 * @param encryptedText - The encrypted text in iv:encrypted format
 * @returns The decrypted plaintext
 */
export function decrypt(encryptedText: string): string {
	const key = getEncryptionKey();

	const parts = encryptedText.split(':');
	if (parts.length !== 2) {
		throw new Error('Invalid encrypted text format');
	}

	const iv = Buffer.from(parts[0], 'hex');
	const encrypted = parts[1];

	const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

	let decrypted = decipher.update(encrypted, 'hex', 'utf8');
	decrypted += decipher.final('utf8');

	return decrypted;
}

/**
 * Checks if the encryption key is configured
 */
export function isEncryptionConfigured(): boolean {
	return !!process.env.TOKEN_ENCRYPTION_KEY;
}
