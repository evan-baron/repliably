import { NextRequest, NextResponse } from 'next/server';
import { sendGmail } from '@/lib/gmail';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
	try {
		const authHeader = request.headers.get('authorization');
		if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		console.log(
			`[${new Date().toISOString()}] Cron: send-scheduled-messages started`
		);

		const messagesToSend = await prisma.message.findMany({
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
			take: 50,
		});

		if (!messagesToSend.length) {
			console.log('No messages to send');
			return NextResponse.json(
				{ message: 'No messages to send' },
				{ status: 200 }
			);
		}

		console.log(`Found ${messagesToSend.length} messages to send`);

		const results = await Promise.allSettled(
			messagesToSend.map(async (message) => {
				const contact = message.contact;
				const sequence = message.sequence;

				if (!sequence) {
					throw new Error('Sequence not found for message ' + message.id);
				}

				const endOfSequence =
					sequence.endDate &&
					sequence.nextStepDue &&
					sequence.nextStepDue > sequence.endDate;
				const passedScheduledAt = new Date() > message.scheduledAt!;
				const passedApprovalDeadline =
					message.approvalDeadline && new Date() > message.approvalDeadline;

				try {
					const result = await sendGmail({
						to: contact.email,
						subject: message.subject,
						html: endOfSequence ? 'Did I lose you?' : message.contents,
					});

					await prisma.message.update({
						where: { id: message.id },
						data: { status: 'sent', messageId: result.messageId || null },
					});
				} catch (error) {}
			})
		);
	} catch (error) {}
}
