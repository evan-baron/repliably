import { Prisma } from '../../generated/prisma';

export type UserFromDB = Prisma.UserGetPayload<{}>;

export type UserToClientFromDB = Omit<UserFromDB, 'auth0Id'>;
