import { Prisma } from '../../generated/prisma';

export type UserFromDB = Prisma.UserGetPayload<{
	include: {
		signatures: {
			orderBy: {
				createdAt: 'desc';
			};
		};
	};
}>;

export type UserToClientFromDB = Omit<UserFromDB, 'auth0Id'>;
