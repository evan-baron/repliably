import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiUser } from '@/services/getUserService';
import { accountSettingsSchema } from '@/lib/validation';
import { z } from 'zod';

export async function PUT(request: NextRequest) {
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

		const body = await request.json();

		// Validate input using Zod schema
		try {
			// Parse and validate - this will filter out any fields not in the schema
			const validatedData = accountSettingsSchema.parse(body.updateData);

			// Remove undefined values (only update fields that were provided)
			const updateData = Object.fromEntries(
				Object.entries(validatedData).filter(
					([_, value]) => value !== undefined,
				),
			);

			// Ensure booleans are actual booleans
			if ('trackEmailOpens' in updateData) {
				updateData.trackEmailOpens = Boolean(updateData.trackEmailOpens);
			}
			if ('trackLinkClicks' in updateData) {
				updateData.trackLinkClicks = Boolean(updateData.trackLinkClicks);
			}
			if ('notificationBounce' in updateData) {
				updateData.notificationBounce = Boolean(updateData.notificationBounce);
			}
			if ('notificationSendFailure' in updateData) {
				updateData.notificationSendFailure = Boolean(
					updateData.notificationSendFailure,
				);
			}
			if ('notificationSequenceComplete' in updateData) {
				updateData.notificationSequenceComplete = Boolean(
					updateData.notificationSequenceComplete,
				);
			}
			if ('notificationMessageApproval' in updateData) {
				updateData.notificationMessageApproval = Boolean(
					updateData.notificationMessageApproval,
				);
			}
			if ('defaultRequireApproval' in updateData) {
				updateData.defaultRequireApproval = Boolean(
					updateData.defaultRequireApproval,
				);
			}
			if ('defaultReferencePrevious' in updateData) {
				updateData.defaultReferencePrevious = Boolean(
					updateData.defaultReferencePrevious,
				);
			}
			if ('defaultAlterSubjectLine' in updateData) {
				updateData.defaultAlterSubjectLine = Boolean(
					updateData.defaultAlterSubjectLine,
				);
			}

			if (updateData.defaultSequenceDuration === -1) {
				updateData.defaultSequenceDuration = null; // Use null to represent "Indefinitely"
			}

			// Update user with validated and sanitized data
			const updatedUser = await prisma.user.update({
				where: { id: user.id },
				data: updateData,
			});

			return NextResponse.json({ success: true, user: updatedUser });
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
	} catch (error) {
		console.error('Error updating user:', error);
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
			{ success: false, error: 'Failed to update user' },
			{ status: 500 },
		);
	}
}
