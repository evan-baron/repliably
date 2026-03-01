import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiUser } from '@/services/getUserService';
import { applyRateLimit } from '@/lib/rateLimit';
import { jsonAuthError, json500, sanitizeMessagesWithContact } from '@/lib/api';

export async function GET(request: NextRequest) {
	try {
		const { user, error } = await getApiUser();
		if (error) return jsonAuthError(error);

		const rateLimited = await applyRateLimit(
			user.id,
			'crud-read',
			user.subscriptionTier,
		);
		if (rateLimited) return rateLimited;

		const messages = await prisma.message.findMany({
			where: { ownerId: user.id },
			include: { contact: true },
			orderBy: { createdAt: 'desc' },
			take: 75, // Limit to 75 messages for performance
		});

		return NextResponse.json({
			messages: sanitizeMessagesWithContact(messages),
		});
	} catch (error) {
		console.error('Error fetching user messages:', error);
		return json500('Failed to fetch user messages');
	}
}
