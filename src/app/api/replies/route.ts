import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiUser } from '@/services/getUserService';
import { applyRateLimit } from '@/lib/rateLimit';
import { jsonAuthError, json500, sanitizeRepliesWithContact } from '@/lib/api';

export async function GET(req: NextRequest) {
	try {
		const { user, error } = await getApiUser();
		if (error) return jsonAuthError(error);

		const rateLimited = await applyRateLimit(user.id, 'crud-read', user.subscriptionTier);
		if (rateLimited) return rateLimited;

		const replies = await prisma.emailReply.findMany({
			where: {
				ownerId: user.id,
			},
			include: {
				contact: true,
			},
			orderBy: {
				replyDate: 'desc',
			},
		});

		return NextResponse.json({ replies: sanitizeRepliesWithContact(replies) });
	} catch (error) {
		console.error('Error fetching replies:', error);
		return json500('Failed to fetch replies');
	}
}
