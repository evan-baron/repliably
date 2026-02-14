import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiUser } from '@/services/getUserService';
import { applyRateLimit } from '@/lib/rateLimit';
import { createSignatureSchema } from '@/lib/validation';
import { z } from 'zod';

export async function POST(request: NextRequest) {
	try {
		const { user, error } = await getApiUser();
		if (error) {
			return NextResponse.json(
				{ error: error.error },
				{ status: error.status },
			);
		}

		if (!user) {
			return NextResponse.json(
				{ error: 'User not authenticated' },
				{ status: 401 },
			);
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
				const errors = validationError.issues.map((issue) => ({
					path: issue.path.join('.'),
					message: issue.message,
				}));
				return NextResponse.json(
					{
						error: 'Validation failed',
						details: errors.map((e) => e.message),
						fields: errors,
					},
					{ status: 400 },
				);
			}
			throw validationError;
		}

		const updatedUser = await prisma.userSignature.create({
			data: {
				userId: user.id,
				...validatedData,
			},
		});

		return NextResponse.json({ success: true, user: updatedUser });
	} catch (error) {
		console.error('Error saving signature:', error);
		let message = 'Unknown error';
		let stack = undefined;
		if (error instanceof Error) {
			message = error.message;
			stack = error.stack;
		}
		console.error('Error details:', {
			message,
			stack,
		});
		return NextResponse.json(
			{ success: false, error: 'Failed to save signature' },
			{ status: 500 },
		);
	}
}
