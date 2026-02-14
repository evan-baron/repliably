import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiUser } from '@/services/getUserService';
import { applyRateLimit } from '@/lib/rateLimit';
import { createSignatureSchema } from '@/lib/validation';
import { z } from 'zod';
import { jsonAuthError, json401, json500, jsonValidationError } from '@/lib/api';

export async function POST(request: NextRequest) {
	try {
		const { user, error } = await getApiUser();
		if (error) return jsonAuthError(error);

		if (!user) {
			return json401('User not authenticated');
		}

		const rateLimited = await applyRateLimit(user.id, 'crud-write', user.subscriptionTier);
		if (rateLimited) return rateLimited;

		const body = await request.json();

		const { emailSignature } = body;

		let validatedData;
		try {
			validatedData = createSignatureSchema.parse(emailSignature);
		} catch (validationError) {
			if (validationError instanceof z.ZodError) {
				return jsonValidationError(validationError);
			}
			throw validationError;
		}

		const signature = await prisma.userSignature.create({
			data: {
				userId: user.id,
				...validatedData,
			},
		});

		return NextResponse.json({ success: true, user: signature });
	} catch (error) {
		console.error('Error saving signature:', error);
		return json500('Failed to save signature');
	}
}
