import { Prisma } from '../../generated/prisma';

export type UserFromDB = Prisma.UserGetPayload<{
	include: {
		signatures: {
			orderBy: {
				createdAt: 'asc';
			};
		};
	};
}>;

export type UserToClientFromDB = Omit<
	UserFromDB,
	| 'auth0Id'
	| 'gmailRefreshToken'
	| 'gmailHistoryId'
	| 'gmailWatchExpiration'
	| 'emailTokenExpiresAt'
>;

export type SignatureFromDB = Prisma.UserSignatureGetPayload<{}>;

export type UserDefaultSettings = {
	alterSubjectLine: boolean;
	referencePreviousEmail: boolean;
	autoSend: boolean;
	autoSendDelay: string;
	cadenceDuration: string;
	followUpCadence: string;
};
