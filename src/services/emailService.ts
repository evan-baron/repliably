import { prisma } from '@/lib/prisma';

// Types imports
import { StoredEmailData } from '@/types/emailTypes';

// Services imports

// Helpers imports
import { parseSequenceData } from '@/lib/helperFunctions';

// Helper function to find or create a contact
export async function findOrCreateContact(email: string, ownerId: number) {
	// Try to find an existing contact with the given email and ownerId
	let contact = await prisma.contact.findFirst({
		where: {
			email: email,
			ownerId: ownerId,
		},
	});

	// If no contact is found, create a new one
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

	// Return the found or newly created contact
	return contact;
}

// Main function to store sent email in the db and handle/update sequences
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
	inReplyTo,
	sequenceId,
	referencePreviousEmail,
	alterSubjectLine,
}: StoredEmailData) {
	// First find or create the contact that will be associated with the message
	const contact = await findOrCreateContact(email, ownerId);

	// Helpers to map cadenceType and cadenceDuration to their respective values
	const cadenceTypeMapping: { [key: string]: number } = {
		'1day': 1,
		'3day': 3,
		'31day': 31,
		weekly: 7,
		biweekly: 14,
		monthly: 28,
		none: 0,
	};

	const cadenceDurationMapping: { [key: string]: number | null } = {
		'30': 30,
		'60': 60,
		'90': 90,
		indefinite: null,
	};

	// Helper to determine sendDelay in days
	const sendDelay =
		sendWithoutReviewAfter === 'never' ||
		sendWithoutReviewAfter === '' ||
		!reviewBeforeSending
			? null
			: sendWithoutReviewAfter
			? parseInt(sendWithoutReviewAfter)
			: null;

	// Helper to simplify sequenceDuration calculation
	const sequenceDuration = cadenceDurationMapping[cadenceDuration];

	// Determine endDate for the sequence
	const endDate = sequenceDuration
		? new Date(Date.now() + sequenceDuration * 24 * 60 * 60 * 1000)
		: null;

	// If cadenceType is 'none', there will be no follow-up emails
	if (cadenceType === 'none') {
		const [createdMessage, updatedContact] = await prisma.$transaction([
			prisma.message.create({
				data: {
					contactId: contact.id,
					ownerId,
					subject,
					contents,
					direction: 'outbound',
					messageId,
					threadId,
					createdAt: new Date(),
					status: 'sent',
				},
			}),
			prisma.contact.update({
				where: { id: contact.id },
				data: { lastActivity: new Date() },
			}),
		]);
		return { createdMessage, updatedContact };
	}

	// If sequenceId is provided, this must be a follow-up email in an existing sequence. Otherwise, it must be the first email in a new sequence.
	if (sequenceId) {
		// There is a sequenceId provided meaning this is a follow-up email in an existing sequence
		// Steps to follow:
		// 1. Fetch the existing sequence
		// 2. Save the message to the db associated with the existing sequence
		// 3. Update the sequence's next step due date and current step count

		// Fetch the existing sequence
		const sequence = await prisma.sequence.findUnique({
			where: { id: sequenceId },
		});

		if (!sequence) {
			throw new Error(`Sequence with id ${sequenceId} not found`);
		}

		// Parse sequence data to get the new next step due date
		const { nextStepDueDate } = parseSequenceData(sequence);

		const [createdMessage, updatedSequence] = await prisma.$transaction([
			// Save the message associated with the existing sequence
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
					inReplyTo: inReplyTo || null,
					createdAt: new Date(),
					status: reviewBeforeSending ? 'pending' : 'sent',
					needsApproval: reviewBeforeSending,
					approvalDeadline:
						reviewBeforeSending && sendDelay
							? new Date(Date.now() + sendDelay * 60 * 1000)
							: null,
					scheduledAt: nextStepDueDate,
				},
			}),

			// Update the sequence's next step due date and current step count
			prisma.sequence.update({
				where: { id: sequence.id },
				data: {
					nextStepDue: nextStepDueDate,
					currentStep: sequence.currentStep + 1,
				},
			}),
		]);

		return { createdMessage, updatedSequence };
	} else {
		// There isn't a sequenceId provided meaning this is the first email in a new sequence
		// Steps to follow:
		// 1. Create the new sequence
		// 2. Save the message to the db associated with the new sequence
		// 3. Update the contact to reflect last activity and change their active status to true

		// Helper function to determine the next step due date for new sequence-to-be
		const nextStepDueDate =
			cadenceType === '31day'
				? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
				: new Date(
						Date.now() + cadenceTypeMapping[cadenceType] * 24 * 60 * 60 * 1000
				  );

		// Create the new sequence
		const sequence = await prisma.sequence.create({
			data: {
				title: subject,
				contactId: contact.id,
				ownerId,
				sequenceType: cadenceType,
				autoSend: reviewBeforeSending ? false : true,
				autoSendDelay: sendDelay,
				sequenceDuration: cadenceDurationMapping[cadenceDuration],
				nextStepDue: nextStepDueDate,
				endDate,
				referencePreviousEmail: referencePreviousEmail,
				alterSubjectLine: alterSubjectLine || null,
			},
		});

		// Transaction safety: create message in transaction
		const [createdMessage, updatedContact] = await prisma.$transaction([
			// Create the message associated with the new sequence
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
					inReplyTo: inReplyTo || null,
					createdAt: new Date(),
					needsApproval: reviewBeforeSending,
					status: reviewBeforeSending ? 'pending' : 'sent',
					approvalDeadline:
						reviewBeforeSending && sendDelay
							? new Date(Date.now() + sendDelay * 60 * 1000)
							: null,
				},
			}),

			// Update the contact's last activity and active status
			prisma.contact.update({
				where: { id: contact.id },
				data: { lastActivity: new Date(), active: true },
			}),
		]);

		return { createdMessage, updatedContact };
	}
}
