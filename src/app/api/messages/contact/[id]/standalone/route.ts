import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiUser } from '@/services/getUserService';
import { applyRateLimit } from '@/lib/rateLimit';
import { jsonAuthError, json500, sanitizeMessages } from '@/lib/api';

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
		const messages = await prisma.message.findMany({
			where: { ownerId: user.id, contactId: contactId, sequenceId: null },
			orderBy: { createdAt: 'desc' },
		});

		return NextResponse.json({ messages: sanitizeMessages(messages) });
	} catch (error) {
		console.error('Error fetching standalone messages for contact:', error);
		return json500('Failed to fetch messages');
	}
}
