import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revokeTokens, clearUserTokens } from '@/lib/googleOAuth';
import { getApiUser } from '@/services/getUserService';
import { decrypt, isEncryptionConfigured } from '@/lib/encryption';

export async function POST() {
	try {
		const { user, error } = await getApiUser();
		if (error) {
			return NextResponse.json(
				{ error: error.error },
				{ status: error.status }
			);
		}

		// Get current tokens to revoke
		const userData = await prisma.user.findUnique({
			where: { id: user.id },
			select: {
				googleAccessToken: true,
				gmailConnected: true,
			},
		});

		if (!userData?.gmailConnected) {
			return NextResponse.json(
				{ error: 'Gmail is not connected' },
				{ status: 400 }
			);
		}

		// Try to revoke the token with Google
		if (userData.googleAccessToken) {
			try {
				const accessToken = isEncryptionConfigured()
					? decrypt(userData.googleAccessToken)
					: userData.googleAccessToken;
				await revokeTokens(accessToken);
			} catch (revokeError) {
				// Log but continue - token might already be invalid
				console.warn('Failed to revoke Google token:', revokeError);
			}
		}

		// Clear tokens from database
		await clearUserTokens(user.id);

		return NextResponse.json({
			success: true,
			message: 'Gmail disconnected successfully',
		});
	} catch (error) {
		console.error('Error disconnecting Gmail:', error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
}
