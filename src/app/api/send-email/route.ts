import { NextRequest, NextResponse } from 'next/server';
import { sendGmail } from '@/lib/gmail';
import { storeSentEmail } from '@/services/emailService';
import { getApiUser } from '@/services/getUserService';
import { prisma } from '@/lib/prisma';
import { deactivateSequence } from '@/services/sequenceService';
import { sendEmailSchema } from '@/lib/validation';
import { applyRateLimit } from '@/lib/rateLimit';
import { z } from 'zod';
import { jsonAuthError, json401, json403, json500, jsonValidationError, sanitizeContact, sanitizeMessage } from '@/lib/api';

export async function POST(req: NextRequest) {
	try {
		const { user, error } = await getApiUser();
		if (error) return jsonAuthError(error);

		if (!user) {
			return json401('User not authenticated');
		}

		const rateLimited = await applyRateLimit(user.id, 'send-email', user.subscriptionTier);
		if (rateLimited) return rateLimited;

		const requestBody = await req.json();

		let validatedData;
		try {
			validatedData = sendEmailSchema.parse(requestBody);
		} catch (validationError) {
			if (validationError instanceof z.ZodError) {
				return jsonValidationError(validationError);
			}
			throw validationError;
		}

		const {
			to,
			subject,
			autoSend,
			cadenceType,
			autoSendDelay,
			cadenceDuration,
			body,
			override,
			referencePreviousEmail,
			alterSubjectLine,
			activeSequenceId,
		} = validatedData;

		const sendAndStoreEmail = async () => {
			const result = await sendGmail({
				userId: user.id,
				to,
				subject,
				html: body,
			});

			if (user && result.messageId && result.threadId) {
				const { createdMessage, updatedContact, newContact } =
					await storeSentEmail({
						email: to,
						ownerId: user.id,
						subject,
						contents: body,
						cadenceType,
						autoSend,
						autoSendDelay,
						cadenceDuration,
						messageId: result.messageId,
						threadId: result.threadId,
						referencePreviousEmail: referencePreviousEmail,
						alterSubjectLine: alterSubjectLine,
					});

				return NextResponse.json({
					success: true,
					messageId: result.messageId,
					threadId: result.threadId,
					contact: updatedContact ? sanitizeContact(updatedContact) : undefined,
					message: createdMessage ? sanitizeMessage(createdMessage) : undefined,
					newContact: newContact,
				});
			}

			return json500('Failed to send email or create message.');
		};

		if (override && activeSequenceId !== undefined) {
			await deactivateSequence(activeSequenceId);
			return await sendAndStoreEmail();
		}

		if (cadenceType === 'none') {
			return await sendAndStoreEmail();
		}

		const existingSequence = await prisma.sequence.findFirst({
			where: {
				contact: {
					email: to,
				},
				ownerId: user.id,
				active: true,
			},
		});

		if (existingSequence) {
			return NextResponse.json(
				{
					sequenceExists: true,
					activeSequenceId: existingSequence.id,
					emailData: {
						to,
						subject,
						autoSend,
						cadenceType,
						autoSendDelay,
						cadenceDuration,
						body,
						referencePreviousEmail,
						alterSubjectLine,
						activeSequenceId: existingSequence.id,
					},
					message: 'Contact already part of an active sequence.',
				},
				{ status: 409 },
			);
		}

		return await sendAndStoreEmail();
	} catch (error) {
		console.error('Email send error:', error);

		if (error instanceof Error) {
			if (
				error.message.includes('Gmail account not connected') ||
				error.message.includes('Gmail connection expired') ||
				error.message.includes('invalid_grant') ||
				error.message.includes('Token has been expired or revoked')
			) {
				return json403(
					'Gmail connection issue. Please reconnect your Gmail account in settings.',
				);
			}

			if (
				error.message.includes('quota') ||
				error.message.includes('rate limit') ||
				error.message.includes('User-rate limit exceeded')
			) {
				return NextResponse.json(
					{ error: 'Gmail rate limit exceeded. Please try again later.' },
					{ status: 429 },
				);
			}

			if (
				error.message.includes('insufficient permissions') ||
				error.message.includes('Insufficient Permission')
			) {
				return json403(
					'Insufficient Gmail permissions. Please reconnect your Gmail account with full permissions.',
				);
			}
		}

		return json500('Failed to send email');
	}
}
