import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/services/getUserService';
import { prisma } from '@/lib/prisma';
import { applyRateLimit } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
	try {
		// 1. Check authentication
		const { user, error } = await getApiUser();
		if (error) {
			return NextResponse.json(
				{ error: error.error },
				{ status: error.status }
			);
		}

		const rateLimited = await applyRateLimit(user.id, 'crud-read', user.subscriptionTier);
		if (rateLimited) return rateLimited;

		// 2. Fetch sequences for the user
		const sequences = await prisma.sequence.findMany({
			where: { ownerId: user.id },
			include: {
				contact: true,
				messages: {
					orderBy: { createdAt: 'desc' },
				},
				emailReplies: {
					orderBy: { replyDate: 'desc' },
				},
			},
		});

		// 3. Return sequences
		return NextResponse.json({ sequences });
	} catch (error: any) {
		console.error('Error fetching sequences:', error);
		return NextResponse.json(
			{ error: error.message || 'Failed to fetch sequences' },
			{ status: 500 }
		);
	}
}
