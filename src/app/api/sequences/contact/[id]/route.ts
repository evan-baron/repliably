import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiUser } from '@/services/getUserService';
import { applyRateLimit } from '@/lib/rateLimit';
import { jsonAuthError, json500, sanitizeSequences } from '@/lib/api';

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { user, error } = await getApiUser();
		if (error) return jsonAuthError(error);

		const rateLimited = await applyRateLimit(user.id, 'crud-read', user.subscriptionTier);
		if (rateLimited) return rateLimited;

		const { id } = await params;
		const contactId = parseInt(id);
		const sequences = await prisma.sequence.findMany({
			where: { ownerId: user.id, contactId: contactId },
			include: {
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
		console.error('Error fetching sequences for contact:', error);
		return json500('Failed to fetch sequences');
	}
}
