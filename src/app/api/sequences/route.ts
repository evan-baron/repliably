import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/services/getUserService';
import { prisma } from '@/lib/prisma';
import { applyRateLimit } from '@/lib/rateLimit';
import { jsonAuthError, json500, sanitizeSequences } from '@/lib/api';

export async function GET(req: NextRequest) {
	try {
		const { user, error } = await getApiUser();
		if (error) return jsonAuthError(error);

		const rateLimited = await applyRateLimit(user.id, 'crud-read', user.subscriptionTier);
		if (rateLimited) return rateLimited;

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

		return NextResponse.json({ sequences: sanitizeSequences(sequences) });
	} catch (error) {
		console.error('Error fetching sequences:', error);
		return json500('Failed to fetch sequences');
	}
}
