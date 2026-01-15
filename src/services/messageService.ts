import { prisma } from '@/lib/prisma';

// Services imports
import { getApiUser } from './getUserService';

// Types imports
import { MessageCreationData } from '@/types/messageTypes';

export async function getAllMessagesByContactId(contactId: number) {
	const { user, error } = await getApiUser();

	if (error || !user) {
		console.error('Error fetching user or user not found:', error);
		return { messages: [] };
	}

	const messages = await prisma.message.findMany({
		where: { ownerId: user.id, contactId: contactId },
		orderBy: { createdAt: 'desc' },
	});

	return { messages };
}

export async function getStandaloneMessagesByContactId(contactId: number) {
	const { user, error } = await getApiUser();

	if (error || !user) {
		console.error('Error fetching user or user not found:', error);
		return { messages: [] };
	}

	const messages = await prisma.message.findMany({
		where: { ownerId: user.id, contactId: contactId, sequenceId: null },
		orderBy: { createdAt: 'desc' },
	});

	return { messages };
}

export async function createMessage(data: MessageCreationData) {
	const { user, error } = await getApiUser();

	if (error || !user) {
		console.error('Error fetching user or user not found:', error);
		throw new Error('Unauthorized');
	}

	const {
		contactId,
		ownerId,
		sequenceId,
		subject,
		contents,
		messageId,
		threadId,
		inReplyTo,
		reviewBeforeSending,
		scheduledAt,
		sendDelay,
		referencePreviousEmail,
	} = data;

	const [createdMessage, updatedContact] = await prisma.$transaction([
		prisma.message.create({
			data: {
				contactId,
				ownerId,
				sequenceId,
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
				scheduledAt,
				referencePreviousEmail: referencePreviousEmail || null,
			},
		}),
		prisma.contact.update({
			where: { id: contactId },
			data: { lastActivity: new Date() },
		}),
	]);
	return { createdMessage, updatedContact };
}
