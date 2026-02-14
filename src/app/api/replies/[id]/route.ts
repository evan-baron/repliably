import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiUser } from '@/services/getUserService';
import { applyRateLimit } from '@/lib/rateLimit';
import { jsonAuthError, json500, sanitizeReply } from '@/lib/api';

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { user, error } = await getApiUser();
		if (error) return jsonAuthError(error);

		const rateLimited = await applyRateLimit(user.id, 'crud-write', user.subscriptionTier);
		if (rateLimited) return rateLimited;

		const { id } = await params;
		const replyId = parseInt(id);
		const reply = await prisma.emailReply.update({
			where: { ownerId: user.id, id: replyId },
			data: {
				processed: true,
			},
		});

		return NextResponse.json({ reply: sanitizeReply(reply) });
	} catch (error) {
		console.error('Error updating reply:', error);
		return json500('Failed to update reply');
	}
}
