export interface MessageFromDB {
	contactId: number;
	ownerId: number;
	id: number;
	contents: string;
	date: string;
	direction: string;
	hasReply: boolean;
	inReplyTo: string | null;
	messageId: string;
	replyDate: string | null;
	sequenceId: number;
	subject: string;
	templateId: number | null;
	threadId: string;
	needsApproval: boolean;
}
