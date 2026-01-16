import { Prisma } from '../../generated/prisma';

export type SequenceFromDB = Prisma.SequenceGetPayload<{
	include: {
		messages: true;
		emailReplies: true;
	};
}>;

export interface SequencesResponse {
	sequences: SequenceFromDB[];
}

// import { MessageFromDB } from './messageTypes';

// export interface SequenceFromDB {
// 	id: number;
// 	title: string;
// 	contactId: number;
// 	ownerId: number;
// 	sequenceType: string;
// 	autoSend: boolean;
// 	autoSendDelay: number | null;
// 	sequenceDuration: number | null;
// 	currentStep: number;
// 	nextStepDue: Date | null;
// 	endDate: Date | null;
// 	active: boolean;
// 	createdAt: Date;
// 	updatedAt: Date;
// 	messages?: MessageFromDB[];
// 	emailReplies?: MessageFromDB[];
// 	referencePreviousEmail?: boolean | null;
// 	alterSubjectLine?: boolean | null;
// }

// export interface SequencesResponse {
// 	sequences: SequenceFromDB[];
// }
