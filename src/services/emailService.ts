import { prisma } from '@/lib/prisma';

// Types imports
import { StoredEmailData } from '@/types/emailTypes';

export async function findOrCreateContact(email: string, ownerId: number) {
	let contact = await prisma.contact.findFirst({
		where: {
			email: email,
			ownerId: ownerId,
		},
	});

	if (!contact) {
		contact = await prisma.contact.create({
			data: {
				email: email,
				ownerId: ownerId,
				firstName: null,
				lastName: null,
				company: null,
				autoCreated: true,
				active: true,
			},
		});
	}

	return contact;
}

export async function storeSentEmail({
	email,
	ownerId,
	subject,
	contents,
	cadenceType,
	reviewBeforeSending,
	sendWithoutReviewAfter,
	cadenceDuration,
	messageId,
	threadId,
}: StoredEmailData) {
	const contact = await findOrCreateContact(email, ownerId);

	let sendDelay = null;
	let nextStepDueDate = null;

	const cadenceTypeMapping: { [key: string]: number } = {
		'1day': 1,
		'3day': 3,
		'31day': 31,
		weekly: 7,
		biweekly: 14,
		monthly: 28,
	};

	const cadenceDurationMapping: { [key: string]: number | null } = {
		'1month': 30,
		'2month': 60,
		'3month': 90,
		indefinite: null,
	};

	if (
		sendWithoutReviewAfter === 'never' ||
		sendWithoutReviewAfter === '' ||
		!reviewBeforeSending
	) {
		sendDelay = null;
	} else {
		sendDelay = sendWithoutReviewAfter
			? parseInt(sendWithoutReviewAfter)
			: null;
	}

	if (sendDelay) {
		nextStepDueDate = new Date(
			Date.now() + cadenceTypeMapping[cadenceType] * 24 * 60 * 60 * 1000
		);
	}

	const endDate = cadenceDurationMapping[cadenceDuration]
		? new Date(
				Date.now() +
					cadenceDurationMapping[cadenceDuration] * 24 * 60 * 60 * 1000
		  )
		: null;

	const sequence = await prisma.sequence.create({
		data: {
			contactId: contact.id,
			ownerId,
			sequenceType: cadenceType,
			autoSend: reviewBeforeSending ? false : true,
			autoSendDelay: sendDelay,
			sequenceDuration: cadenceDurationMapping[cadenceDuration],
			nextStepDue: nextStepDueDate,
			endDate,
		},
	});

	// Transaction safety: create message in transaction
	const [createdMessage, updatedContact] = await prisma.$transaction([
		prisma.message.create({
			data: {
				contactId: contact.id,
				ownerId,
				sequenceId: sequence.id,
				subject,
				contents,
				direction: 'outbound',
				messageId,
				threadId,
				date: new Date(),
			},
		}),
		prisma.contact.update({
			where: { id: contact.id },
			data: { lastActivity: new Date(), active: true },
		}),
	]);

	return { createdMessage, updatedContact };
}
