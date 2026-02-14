// --- Contact sanitizers ---

export function sanitizeContact<T extends { ownerId?: number }>(
	contact: T,
): Omit<T, 'ownerId'> {
	const { ownerId, ...rest } = contact;
	return rest;
}

export function sanitizeContacts<T extends { ownerId?: number }>(
	contacts: T[],
): Omit<T, 'ownerId'>[] {
	return contacts.map(sanitizeContact);
}

// --- Message sanitizers ---

export function sanitizeMessage<
	T extends { ownerId?: number; lastError?: string | null; templateId?: number | null },
>(message: T): Omit<T, 'ownerId' | 'lastError' | 'templateId'> {
	const { ownerId, lastError, templateId, ...rest } = message;
	return rest;
}

export function sanitizeMessages<
	T extends { ownerId?: number; lastError?: string | null; templateId?: number | null },
>(messages: T[]): Omit<T, 'ownerId' | 'lastError' | 'templateId'>[] {
	return messages.map(sanitizeMessage);
}

export function sanitizeMessageWithContact<
	T extends Record<string, unknown> & {
		ownerId?: number;
		lastError?: string | null;
		templateId?: number | null;
		contact: Record<string, unknown> & { ownerId?: number };
	},
>(message: T): Omit<T, 'ownerId' | 'lastError' | 'templateId'> {
	const { ownerId, lastError, templateId, contact, ...rest } = message;
	const result: Record<string, unknown> = {
		...rest,
		contact: sanitizeContact(contact),
	};
	return result as Omit<T, 'ownerId' | 'lastError' | 'templateId'>;
}

export function sanitizeMessagesWithContact<
	T extends Record<string, unknown> & {
		ownerId?: number;
		lastError?: string | null;
		templateId?: number | null;
		contact: Record<string, unknown> & { ownerId?: number };
	},
>(messages: T[]): Omit<T, 'ownerId' | 'lastError' | 'templateId'>[] {
	return messages.map(sanitizeMessageWithContact);
}

// --- Reply sanitizers ---

export function sanitizeReply<T extends { ownerId?: number }>(
	reply: T,
): Omit<T, 'ownerId'> {
	const { ownerId, ...rest } = reply;
	return rest;
}

export function sanitizeReplies<T extends { ownerId?: number }>(
	replies: T[],
): Omit<T, 'ownerId'>[] {
	return replies.map(sanitizeReply);
}

export function sanitizeReplyWithContact<
	T extends Record<string, unknown> & {
		ownerId?: number;
		contact?: Record<string, unknown> & { ownerId?: number };
	},
>(reply: T): Omit<T, 'ownerId'> {
	const { ownerId, contact, ...rest } = reply;
	const result: Record<string, unknown> = { ...rest };
	if (contact) {
		result.contact = sanitizeContact(contact);
	}
	return result as Omit<T, 'ownerId'>;
}

export function sanitizeRepliesWithContact<
	T extends Record<string, unknown> & {
		ownerId?: number;
		contact?: Record<string, unknown> & { ownerId?: number };
	},
>(replies: T[]): Omit<T, 'ownerId'>[] {
	return replies.map(sanitizeReplyWithContact);
}

// --- Sequence sanitizers ---

export function sanitizeSequence<
	T extends Record<string, unknown> & {
		ownerId?: number;
		contact?: { ownerId?: number };
		messages?: { ownerId?: number; lastError?: string | null; templateId?: number | null }[];
		emailReplies?: { ownerId?: number }[];
	},
>(sequence: T): Omit<T, 'ownerId'> {
	const { ownerId, contact, messages, emailReplies, ...rest } = sequence;

	const result: Record<string, unknown> = { ...rest };

	if (contact) {
		result.contact = sanitizeContact(contact);
	}
	if (messages) {
		result.messages = sanitizeMessages(messages);
	}
	if (emailReplies) {
		result.emailReplies = sanitizeReplies(emailReplies);
	}

	return result as Omit<T, 'ownerId'>;
}

export function sanitizeSequences<
	T extends Record<string, unknown> & {
		ownerId?: number;
		contact?: { ownerId?: number };
		messages?: { ownerId?: number; lastError?: string | null; templateId?: number | null }[];
		emailReplies?: { ownerId?: number }[];
	},
>(sequences: T[]): Omit<T, 'ownerId'>[] {
	return sequences.map(sanitizeSequence);
}

// --- User sanitizer ---

export function sanitizeUser<
	T extends {
		auth0Id?: string | null;
		gmailRefreshToken?: string | null;
		gmailHistoryId?: string | null;
		gmailWatchExpiration?: Date | null;
		emailTokenExpiresAt?: Date | null;
	},
>(
	user: T,
): Omit<
	T,
	| 'auth0Id'
	| 'gmailRefreshToken'
	| 'gmailHistoryId'
	| 'gmailWatchExpiration'
	| 'emailTokenExpiresAt'
> {
	const {
		auth0Id,
		gmailRefreshToken,
		gmailHistoryId,
		gmailWatchExpiration,
		emailTokenExpiresAt,
		...rest
	} = user;
	return rest;
}
