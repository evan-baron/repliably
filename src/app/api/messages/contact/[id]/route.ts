import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiUser } from '@/services/getUserService';
import { applyRateLimit } from '@/lib/rateLimit';

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
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

		const { id } = await params;
		const contactId = parseInt(id);
		const messages = await prisma.message.findMany({
			where: { ownerId: user.id, contactId: contactId },
			orderBy: { createdAt: 'desc' },
		});

		return NextResponse.json({ messages });
	} catch (error: any) {
		console.error('Error fetching sequences for contact:', error);
		return NextResponse.json(
			{ error: error.message || 'Failed to fetch sequences' },
			{ status: 500 }
		);
	}
}
