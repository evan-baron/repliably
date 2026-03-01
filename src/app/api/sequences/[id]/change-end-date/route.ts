import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiUser } from '@/services/getUserService';
import { applyRateLimit } from '@/lib/rateLimit';
import { jsonAuthError, json400, json404, json500, sanitizeSequence } from '@/lib/api';

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
		if (isNaN(sequenceId)) return json400('Invalid sequence ID');

		const { endDate } = await request.json();
		if (!endDate) return json400('endDate is required');

		const parsedDate = new Date(endDate);
		if (isNaN(parsedDate.getTime())) return json400('Invalid date format');
		if (parsedDate <= new Date()) return json400('endDate must be in the future');

		const sequence = await prisma.sequence.findFirst({
			where: { id: sequenceId, ownerId: user.id },
		});
		if (!sequence) return json404('Sequence not found');
		if (!sequence.active) return json400('Cannot extend an inactive sequence');

		const updatedSequence = await prisma.sequence.update({
			where: { id: sequenceId, ownerId: user.id },
			data: { endDate: parsedDate },
		});

		return NextResponse.json({ sequence: sanitizeSequence(updatedSequence) });
	} catch (error) {
		console.error('Error extending sequence:', error);
		return json500('Failed to extend sequence');
	}
}
