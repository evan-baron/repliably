import { prisma } from '@/lib/prisma';

// Services imports
import { getApiUser } from './getUserService';

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
