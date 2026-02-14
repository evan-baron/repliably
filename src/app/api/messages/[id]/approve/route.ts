import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiUser } from '@/services/getUserService';
import { applyRateLimit } from '@/lib/rateLimit';
import { jsonAuthError, json500, sanitizeMessage } from '@/lib/api';

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
		const messageId = parseInt(id);

		const message = await prisma.message.update({
			where: { ownerId: user.id, id: messageId },
			data: { needsApproval: false, approved: true, status: 'scheduled' },
		});

		return NextResponse.json({ message: sanitizeMessage(message) });
	} catch (error) {
		console.error('Error approving message:', error);
		return json500('Failed to approve message');
	}
}
