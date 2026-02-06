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

export type UserToClientFromDB = Omit<UserFromDB, 'auth0Id'>;

export type SignatureFromDB = Prisma.UserSignatureGetPayload<{}>;
