import { prisma } from '@/lib/prisma';

// Types imports
import { StoredEmailData } from '@/types/emailTypes';

// Helper function to find or create a contact
export async function findOrCreateContact(email: string, ownerId: number) {
	let newContact = false;

	// Try to find an existing contact with the given email and ownerId
	let contact = await prisma.contact.findFirst({
		where: {
			email: email,
			ownerId: ownerId,
		},
	});

	// If no contact is found, create a new one
	if (!contact) {
		newContact = true;
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
	return { contact, newContact };
}

// Main function to store sent email in the db and handle/update sequences
export async function storeSentEmail({
	email,
	ownerId,
	subject,
	contents,
	cadenceType,
	autoSend,
	autoSendDelay,
	cadenceDuration,
	messageId,
	threadId,
	referencePreviousEmail,
	alterSubjectLine,
}: StoredEmailData) {
	// First find or create the contact that will be associated with the message
	const { contact, newContact } = await findOrCreateContact(email, ownerId);

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
		autoSendDelay === 'never' || autoSendDelay === '' || !autoSend
			? null
			: autoSendDelay
			? parseInt(autoSendDelay)
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
					sentAt: new Date(),
				},
			}),
			prisma.contact.update({
				where: { id: contact.id },
				data: { lastActivity: new Date() },
			}),
		]);
		return { createdMessage, updatedContact, newContact };
	}

	// Because cadenceType is not 'none', we need to create a new sequence
	// Steps to follow:
	// 1. Create the new sequence
	// 2. Save the message to the db associated with the new sequence
	// 3. Update the contact to reflect last activity and change their active status to true
	// 4. Create the next message in the sequence (if applicable)

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
			autoSend: autoSend ? false : true,
			autoSendDelay: sendDelay,
			sequenceDuration: cadenceDurationMapping[cadenceDuration],
			nextStepDue: nextStepDueDate,
			endDate,
			referencePreviousEmail: referencePreviousEmail || null,
			alterSubjectLine: alterSubjectLine || null,
		},
	});

	// Transaction safety: create message and update contact in transaction
	const [createdMessage, updatedContact] = await prisma.$transaction([
		// Create the message associated with the new sequence (this is technically the first message in the sequence)
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
				createdAt: new Date(),
				status: 'sent',
				sentAt: new Date(),
				needsFollowUp: true,
			},
		}),

		// Update the contact's last activity and active status
		prisma.contact.update({
			where: { id: contact.id },
			data: { lastActivity: new Date(), active: true },
		}),
	]);

	console.log(
		`Stored sent message ${createdMessage.id} and created sequence ${sequence.id} for contact ${contact.id}`
	);

	return { createdMessage, updatedContact, newContact };
}
