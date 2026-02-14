import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiUser } from '@/services/getUserService';
import { applyRateLimit } from '@/lib/rateLimit';
import { jsonAuthError, json500, sanitizeSequence, sanitizeContact } from '@/lib/api';

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { user, error } = await getApiUser();
		if (error) return jsonAuthError(error);

		const rateLimited = await applyRateLimit(user.id, 'crud-read', user.subscriptionTier);
		if (rateLimited) return rateLimited;

		const { id } = await params;
		const sequenceId = parseInt(id);
		const sequence = await prisma.sequence.findFirst({
			where: { ownerId: user.id, id: sequenceId },
			include: {
				messages: {
					orderBy: { createdAt: 'desc' },
				},
				emailReplies: {
					orderBy: { replyDate: 'desc' },
				},
			},
		});

		return NextResponse.json({ sequence: sequence ? sanitizeSequence(sequence) : null });
	} catch (error) {
		console.error('Error fetching sequence:', error);
		return json500('Failed to fetch sequence');
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { user, error } = await getApiUser();
		if (error) return jsonAuthError(error);

		const rateLimited = await applyRateLimit(user.id, 'crud-write', user.subscriptionTier);
		if (rateLimited) return rateLimited;

		const { id } = await params;
		const sequenceId = parseInt(id);
		const updatedSequence = await prisma.sequence.update({
			where: { ownerId: user.id, id: sequenceId },
			data: { active: false, endDate: new Date() },
		});
		const deletedMessages = await prisma.message.deleteMany({
			where: {
				sequenceId: sequenceId,
				ownerId: user.id,
				status: { in: ['pending', 'scheduled'] },
			},
		});
		const updatedContact = await prisma.contact.update({
			where: { id: updatedSequence.contactId },
			data: { active: false },
		});
		return NextResponse.json({
			updatedSequence: sanitizeSequence(updatedSequence),
			deletedMessages,
			updatedContact: sanitizeContact(updatedContact),
		});
	} catch (error) {
		console.error('Error updating sequence:', error);
		return json500('Failed to update sequence');
	}
}
