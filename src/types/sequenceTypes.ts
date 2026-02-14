import { Prisma } from '../../generated/prisma';

export type SequenceFromDB = Prisma.SequenceGetPayload<{
	include: {
		contact: true;
		messages: true;
		emailReplies: true;
	};
}>;

// Sanitized variant with internal fields stripped
export type SanitizedSequence = Omit<SequenceFromDB, 'ownerId'>;

export interface SequencesResponse {
	sequences: SanitizedSequence[];
}
