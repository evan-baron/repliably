import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiUser } from '@/services/getUserService';
import { applyRateLimit } from '@/lib/rateLimit';
import { messageUpdateSchema } from '@/lib/validation';
import { z } from 'zod';
import { jsonAuthError, json500, jsonValidationError, sanitizeMessage } from '@/lib/api';

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { user, error } = await getApiUser();
		if (error) return jsonAuthError(error);

		const rateLimited = await applyRateLimit(user.id, 'crud-write', user.subscriptionTier);
		if (rateLimited) return rateLimited;

		const body = await request.json();

		let validatedData;
		try {
			validatedData = messageUpdateSchema.parse(body);
		} catch (validationError) {
			if (validationError instanceof z.ZodError) {
				return jsonValidationError(validationError);
			}
			throw validationError;
		}

		const { id } = await params;
		const messageId = parseInt(id);

		const message = await prisma.message.update({
			where: { ownerId: user.id, id: messageId },
			data: {
				contents: validatedData.contents,
				subject: validatedData.subject,
				status: 'scheduled',
				approved: true,
			},
		});

		return NextResponse.json({ message: sanitizeMessage(message) });
	} catch (error) {
		console.error('Error updating message:', error);
		return json500('Failed to update message');
	}
}
