import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
	try {
		const authHeader = request.headers.get('authorization');
		if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		console.log(
			`[${new Date().toISOString()}] Cron: update-pending-messages started`
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
			take: 50,
		});

		if (!candidates.length) {
			console.log('No messages to update');
			return NextResponse.json(
				{ message: 'No messages to update' },
				{ status: 200 }
			);
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
			return NextResponse.json(
				{ message: 'No messages were claimed for processing' },
				{ status: 200 }
			);
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
			return NextResponse.json(
				{ message: 'No messages to update' },
				{ status: 200 }
			);
		}

		console.log(`Found ${messagesToUpdate.length} messages to update`);

		const results = await Promise.allSettled(
			messagesToUpdate.map(async (message) => {
				const sequence = message.sequence;

				if (!sequence) {
					throw new Error('Sequence not found for message ' + message.id);
				}

				try {
					await prisma.message.update({
						where: { id: message.id },
						data: {
							status: 'scheduled',
						},
					});

					return { success: true, messageId: message.id };
				} catch (error) {
					console.error(`Error updating message ${message.id}:`, error);
					return {
						success: false,
						messageId: message.id,
						error: (error as Error).message,
					};
				}
			})
		);

		const succeeded = results.filter(
			(res) => res.status === 'fulfilled' && res.value.success
		).length;
		const failed = results.length - succeeded;

		console.log(
			`[${new Date().toISOString()}] Cron: update-pending-messages completed. Succeeded: ${succeeded}, Failed: ${failed}`
		);

		return NextResponse.json({
			success: true,
			processed: results.length,
			succeeded,
			failed,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error('Error in update-pending-messages cron:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error', details: (error as Error).message },
			{ status: 500 }
		);
	}
}
