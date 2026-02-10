import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function runUpdatePendingMessages({ limit }: { limit: number }) {
	const limitValue = Math.min(Math.max(1, limit || 50), 100); // Ensure limit is between 1 and 100 though the API route should already enforce it will always be 50

	console.log(
		`[${new Date().toISOString()}] Cron: update-pending-messages started`,
	);

	// Fetching all messages that are pending, need approval, are scheduled to be sent where scheduledAt is right now or in the past, and sequence is still active
	const candidates = await prisma.message.findMany({
		where: {
			status: 'pending',
			needsApproval: true,
			scheduledAt: { lte: new Date() },
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
		console.log('No messages to update');
		return {
			success: true,
			processed: 0,
			succeeded: 0,
			failed: 0,
			message: 'No messages to update',
		};
	}

	const candidateIds = candidates.map((msg) => msg.id);

	console.log(`Found ${candidates.length} messages to update`);

	const claimResult = await prisma.message.updateMany({
		where: {
			id: { in: candidateIds },
			status: 'pending',
		},
		data: { status: 'processing' },
	});

	if (!claimResult.count) {
		console.log('No messages were claimed for processing');
		return {
			success: true,
			processed: 0,
			succeeded: 0,
			failed: 0,
			message: 'No messages were claimed for processing',
		};
	}

	const messagesToUpdate = await prisma.message.findMany({
		where: {
			id: { in: candidateIds },
			status: 'processing',
		},
		include: {
			contact: true,
			sequence: true,
		},
	});

	if (!messagesToUpdate.length) {
		console.log('No messages to update');
		return {
			success: true,
			processed: 0,
			succeeded: 0,
			failed: 0,
			message: 'No messages to update',
		};
	}

	console.log(`Found ${messagesToUpdate.length} messages to update`);

	const results = await Promise.allSettled(
		messagesToUpdate.map(async (message) => {
			try {
				// ✅ Validate sequence exists
				if (!message.sequence) {
					console.error(`Message ${message.id} missing sequence`);
					await prisma.message.update({
						where: { id: message.id },
						data: { status: 'failed', lastError: 'Sequence not found' },
					});
					return {
						success: false,
						messageId: message.id,
						error: 'Sequence not found',
					};
				}

				// ✅ Validate sequence is still active
				if (!message.sequence.active) {
					console.log(
						`Message ${message.id} sequence is inactive, marking as cancelled`,
					);
					await prisma.message.update({
						where: { id: message.id },
						data: { status: 'cancelled', lastError: 'Sequence inactive' },
					});
					return {
						success: false,
						messageId: message.id,
						error: 'Sequence inactive',
					};
				}

				// ✅ Validate scheduledAt exists and is valid
				if (!message.scheduledAt) {
					console.error(`Message ${message.id} has no scheduledAt date`);
					await prisma.message.update({
						where: { id: message.id },
						data: { status: 'failed', lastError: 'No scheduled date' },
					});
					return {
						success: false,
						messageId: message.id,
						error: 'No scheduled date',
					};
				}

				// ✅ Validate scheduledAt is not in the future (safety check)
				if (message.scheduledAt > new Date()) {
					console.warn(
						`Message ${message.id} scheduledAt is in the future, keeping as pending`,
					);
					await prisma.message.update({
						where: { id: message.id },
						data: { status: 'pending', lastError: 'Scheduled for future' },
					});
					return {
						success: false,
						messageId: message.id,
						error: 'Scheduled for future',
					};
				}

				// ✅ Update status from pending to scheduled
				await prisma.message.update({
					where: { id: message.id },
					data: {
						status: 'scheduled',
					},
				});

				console.log(`Updated message ${message.id} from pending to scheduled`);
				return { success: true, messageId: message.id };
			} catch (error) {
				console.error(`Error updating message ${message.id}:`, error);

				// ✅ Restore to pending on error for retry
				try {
					await prisma.message.update({
						where: { id: message.id },
						data: { status: 'pending', lastError: 'Error during update' },
					});
				} catch (rollbackError) {
					console.error(
						`Failed to rollback message ${message.id}:`,
						rollbackError,
					);
				}

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
		`[${new Date().toISOString()}] Cron: update-pending-messages completed. Succeeded: ${succeeded}, Failed: ${failed}`,
	);

	return {
		success: true,
		processed: results.length,
		succeeded,
		failed,
		timestamp: new Date().toISOString(),
	};
}
