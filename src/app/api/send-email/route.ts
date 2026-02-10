import { NextRequest, NextResponse } from 'next/server';
import { sendGmail } from '@/lib/gmail';
import { storeSentEmail } from '@/services/emailService';
import { getApiUser } from '@/services/getUserService';
import { prisma } from '@/lib/prisma';
import { deactivateSequence } from '@/services/sequenceService';
import { sendEmailSchema } from '@/lib/validation';
import { z } from 'zod';

export async function POST(req: NextRequest) {
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

		const requestBody = await req.json();

		// Validate input using Zod schema
		let validatedData;
		try {
			validatedData = sendEmailSchema.parse(requestBody);
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

		// Helper: send email and update contact
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
					contact: updatedContact,
					message: createdMessage,
					newContact: newContact,
				});
			}

			return NextResponse.json(
				{ error: 'Failed to send email or create message.' },
				{ status: 500 },
			);
		};

		// Handle override: true logic
		if (override && activeSequenceId !== undefined) {
			await deactivateSequence(activeSequenceId);
			return await sendAndStoreEmail();
		}

		// Check if standalone email or part of sequence
		if (cadenceType === 'none') {
			return await sendAndStoreEmail();
		}

		// Check if user has an existing sequence, if it matches the sequenceId passed in, or not
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
	} catch (error: any) {
		console.error('Email send error:', error);

		// Handle specific Gmail errors
		if (error instanceof Error) {
			// Check for OAuth/connection errors
			if (
				error.message.includes('Gmail account not connected') ||
				error.message.includes('Gmail connection expired') ||
				error.message.includes('invalid_grant') ||
				error.message.includes('Token has been expired or revoked')
			) {
				return NextResponse.json(
					{
						error:
							'Gmail connection issue. Please reconnect your Gmail account in settings.',
					},
					{ status: 403 },
				);
			}

			// Check for quota/rate limit errors
			if (
				error.message.includes('quota') ||
				error.message.includes('rate limit') ||
				error.message.includes('User-rate limit exceeded')
			) {
				return NextResponse.json(
					{
						error: 'Gmail rate limit exceeded. Please try again later.',
					},
					{ status: 429 },
				);
			}

			// Check for permission errors
			if (
				error.message.includes('insufficient permissions') ||
				error.message.includes('Insufficient Permission')
			) {
				return NextResponse.json(
					{
						error:
							'Insufficient Gmail permissions. Please reconnect your Gmail account with full permissions.',
					},
					{ status: 403 },
				);
			}
		}

		// Generic error
		return NextResponse.json(
			{ error: error.message || 'Failed to send email' },
			{ status: 500 },
		);
	}
}
