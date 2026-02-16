import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiUser } from '@/services/getUserService';
import { applyRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
	try {
		// Get the authenticated user
		const { user, error } = await getApiUser();
		if (error || !user) {
			return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
		}

		const rateLimited = await applyRateLimit(
			user.id,
			'auth-action',
			user.subscriptionTier,
		);
		if (rateLimited) return rateLimited;

		// Clear Gmail connection data from database
		await prisma.user.update({
			where: { id: user.id },
			data: {
				gmailRefreshToken: null,
				connectedEmail: null,
				emailConnectedAt: null,
				emailConnectionActive: false,
				emailTokenExpiresAt: null,
			},
		});

		return NextResponse.json({
			success: true,
			message: 'Gmail account disconnected successfully',
		});
	} catch (error) {
		console.error('Disconnect error:', error);
		return NextResponse.json(
			{ error: 'Failed to disconnect Gmail account' },
			{ status: 500 },
		);
	}
}
