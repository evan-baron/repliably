import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For AES, this is always 16 bytes
const SALT_LENGTH = 64;

// Get encryption key from environment
const getEncryptionKey = (): Buffer => {
	const key = process.env.ENCRYPTION_KEY;
	if (!key) {
		throw new Error('ENCRYPTION_KEY is not set in environment variables');
	}

	// Convert hex string to buffer
	return Buffer.from(key, 'hex');
};

/**
 * Encrypts a string using AES-256-GCM
 * @param text - The plain text to encrypt
 * @returns Encrypted string in format: iv:salt:tag:encryptedData (all hex encoded)
 */
export const encrypt = (text: string): string => {
	try {
		const key = getEncryptionKey();

		// Generate random IV and salt
		const iv = crypto.randomBytes(IV_LENGTH);
		const salt = crypto.randomBytes(SALT_LENGTH);

		// Create cipher
		const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

		// Encrypt the text
		let encrypted = cipher.update(text, 'utf8', 'hex');
		encrypted += cipher.final('hex');

		// Get the auth tag
		const tag = cipher.getAuthTag();

		// Return format: iv:salt:tag:encryptedData
		return `${iv.toString('hex')}:${salt.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
	} catch (error) {
		console.error('Encryption error:', error);
		throw new Error('Failed to encrypt data');
	}
};

/**
 * Decrypts a string that was encrypted with the encrypt function
 * @param encryptedText - The encrypted string in format: iv:salt:tag:encryptedData
 * @returns Decrypted plain text
 */
export const decrypt = (encryptedText: string): string => {
	try {
		const key = getEncryptionKey();

		// Split the encrypted text into components
		const parts = encryptedText.split(':');
		if (parts.length !== 4) {
			throw new Error('Invalid encrypted text format');
		}

		const [ivHex, _saltHex, tagHex, encryptedData] = parts;

		// Convert hex strings back to buffers
		const iv = Buffer.from(ivHex, 'hex');
		const tag = Buffer.from(tagHex, 'hex');

		// Create decipher
		const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
		decipher.setAuthTag(tag);

		// Decrypt the data
		let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
		decrypted += decipher.final('utf8');

		return decrypted;
	} catch (error) {
		console.error('Decryption error:', error);
		throw new Error('Failed to decrypt data');
	}
};
