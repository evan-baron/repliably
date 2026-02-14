import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiUser } from '@/services/getUserService';
import { applyRateLimit } from '@/lib/rateLimit';
import { accountSettingsSchema } from '@/lib/validation';
import { z } from 'zod';
import { jsonAuthError, json401, json500, jsonValidationError, sanitizeUser } from '@/lib/api';

export async function PUT(request: NextRequest) {
	try {
		const { user, error } = await getApiUser();
		if (error) return jsonAuthError(error);

		if (!user) {
			return json401('User not authenticated');
		}

		const rateLimited = await applyRateLimit(user.id, 'crud-write', user.subscriptionTier);
		if (rateLimited) return rateLimited;

		const body = await request.json();

		try {
			const validatedData = accountSettingsSchema.parse(body.updateData);

			const updateData = Object.fromEntries(
				Object.entries(validatedData).filter(
					([_, value]) => value !== undefined,
				),
			);

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
				updateData.defaultSequenceDuration = null;
			}

			const updatedUser = await prisma.user.update({
				where: { id: user.id },
				data: updateData,
				include: {
					signatures: {
						orderBy: {
							createdAt: 'asc',
						},
					},
				},
			});

			return NextResponse.json({ success: true, user: sanitizeUser(updatedUser) });
		} catch (validationError) {
			if (validationError instanceof z.ZodError) {
				return jsonValidationError(validationError);
			}
			throw validationError;
		}
	} catch (error) {
		console.error('Error updating user:', error);
		return json500('Failed to update user');
	}
}
