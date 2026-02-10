import { sendGmail } from '@/lib/gmail';
import { prisma } from '@/lib/prisma';
import { parseSequenceData } from '@/lib/helpers/sequenceHelpers';

export async function runSendScheduledMessages({ limit }: { limit: number }) {
	const limitValue = Math.min(Math.max(1, limit || 50), 100); // Ensure limit is between 1 and 100 though the API route should already enforce it will always be 50

	console.log(
		`[${new Date().toISOString()}] Cron: send-scheduled-messages started`,
	);

	// Fetching all messages that are scheduled to be sent where scheduledAt is right now or in the past
	const candidates = await prisma.message.findMany({
		where: {
			scheduledAt: { lte: new Date() },
			status: 'scheduled',
			sequence: {
				is: {
					active: true,
				},
			},
		},
		include: {
			contact: true,
			sequence: true,
		},
		take: limitValue,
	});

	if (!candidates.length) {
		console.log('No messages to send');
		return {
			success: true,
			processed: 0,
			message: 'No messages to send',
		};
	}

	const candidateIds = candidates.map((c) => c.id);

	console.log(`Found ${candidates.length} messages to send`);

	const claimResult = await prisma.message.updateMany({
		where: { id: { in: candidateIds }, status: 'scheduled' },
		data: { status: 'processing' }, // assumes 'processing' is a valid status value
	});

	if (!claimResult.count) {
		console.log('No messages claimed (another cron may have taken them)');
		return {
			success: true,
			processed: 0,
			message: 'No messages claimed (another cron may have taken them)',
		};
	}

	const messagesToSend = await prisma.message.findMany({
		where: { id: { in: candidateIds }, status: 'processing' },
		include: { contact: true, sequence: true },
	});

	const results = await Promise.allSettled(
		messagesToSend.map(async (message) => {
			const now = new Date();

			try {
				if (!message.contact || !message.sequence) {
					console.error(`Message ${message.id} missing contact or sequence`);
					await prisma.message.update({
						where: { id: message.id },
						data: {
							status: 'failed',
							lastError: 'Missing contact or sequence data',
						},
					});
					return {
						success: false,
						messageId: message.id,
						error: 'Missing required data',
					};
				}

				const contact = message.contact;
				const sequence = message.sequence;

				// Validate sequence still active
				if (!sequence.active) {
					console.log(`Message ${message.id} sequence is inactive`);
					await prisma.message.update({
						where: { id: message.id },
						data: {
							status: 'cancelled',
							lastError: 'Sequence deactivated',
						},
					});
					return {
						success: false,
						messageId: message.id,
						error: 'Sequence inactive',
					};
				}

				// Validate email format
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!contact.email || !emailRegex.test(contact.email)) {
					console.error(
						`Invalid email for message ${message.id}: ${contact.email}`,
					);
					await prisma.message.update({
						where: { id: message.id },
						data: {
							status: 'failed',
							lastError: 'Invalid email address',
						},
					});
					return {
						success: false,
						messageId: message.id,
						error: 'Invalid email address',
					};
				}

				// Validate subject and content aren't empty
				if (!message.subject?.trim() || !message.contents?.trim()) {
					console.error(`Message ${message.id} has empty subject or content`);
					await prisma.message.update({
						where: { id: message.id },
						data: {
							status: 'failed',
							lastError: 'Empty subject or content',
						},
					});
					return {
						success: false,
						messageId: message.id,
						error: 'Empty subject or content',
					};
				}

				// If message requires approval and is not approved, skip if there's no deadline (wait indefinitely) or if there's a future approvalDeadline
				if (message.needsApproval && !message.approved) {
					const shouldSkip =
						!message.approvalDeadline ||
						(message.approvalDeadline && now < message.approvalDeadline);

					if (shouldSkip) {
						await prisma.message.update({
							where: { id: message.id },
							data: { status: 'scheduled' },
						});
						return {
							success: false,
							messageId: message.id,
							error: 'Approval pending',
						};
					}
				}

				const endOfSequence =
					sequence.endDate &&
					sequence.nextStepDue &&
					sequence.nextStepDue > sequence.endDate;
				const passedApprovalDeadline =
					message.approvalDeadline && new Date() > message.approvalDeadline;
				const newCurrentStep = sequence.currentStep + 1;
				const { nextStepDueDate } = parseSequenceData(
					sequence.sequenceType,
					newCurrentStep,
					sequence.endDate,
				);

				// If scheduled but not yet approved, and approval deadline not yet passed, skip sending
				if (
					message.status === 'processing' &&
					message.needsApproval &&
					!message.approved &&
					!passedApprovalDeadline
				) {
					await prisma.message.update({
						where: { id: message.id },
						data: { status: 'scheduled' },
					});
					return {
						success: false,
						messageId: message.id,
						error: 'Approval pending',
					};
				}

				const result = await sendGmail({
					userId: sequence.ownerId,
					to: contact.email,
					subject: message.subject,
					html: endOfSequence ? 'Did I lose you?' : message.contents,
				});

				await prisma.$transaction([
					prisma.message.update({
						where: { id: message.id },
						data: {
							status: 'sent',
							messageId: result.messageId || null,
							needsFollowUp: !endOfSequence,
							nextMessageGenerated: false,
							sentAt: new Date(),
						},
					}),

					prisma.sequence.update({
						where: { id: sequence.id },
						data: {
							updatedAt: new Date(),
							nextStepDue: endOfSequence ? null : nextStepDueDate,
							currentStep:
								endOfSequence ? sequence.currentStep : newCurrentStep,
							active: endOfSequence ? false : true,
						},
					}),

					prisma.contact.update({
						where: { id: contact.id },
						data: { lastActivity: new Date() },
					}),
				]);

				return { success: true, messageId: message.id };
			} catch (error) {
				console.error(`Error sending message ${message.id}:`, error);

				// ✅ Distinguish permanent vs temporary failures
				const isPermanentError =
					error instanceof Error &&
					(error.message.includes('Invalid email') ||
						error.message.includes('Gmail account not connected') ||
						error.message.includes('Insufficient Permission') ||
						error.message.includes('invalid_grant') ||
						error.message.includes('Token has been expired'));

				await prisma.message.update({
					where: { id: message.id },
					data: {
						status: isPermanentError ? 'failed' : 'scheduled',
						lastError: (error as Error).message,
					},
				});

				return {
					success: false,
					messageId: message.id,
					error: (error as Error).message,
				};
			}
		}),
	);

	const succeeded = results.filter(
		(res) => res.status === 'fulfilled' && res.value?.success,
	).length;
	const failed = results.length - succeeded;

	console.log(
		`[${new Date().toISOString()}] Cron: send-scheduled-messages completed. Succeeded: ${succeeded}, Failed: ${failed}`,
	);

	return {
		success: true,
		processed: results.length,
		succeeded,
		failed,
		timestamp: new Date().toISOString(),
	};
}
