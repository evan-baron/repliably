import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';

export async function getApiUser() {
	const session = await auth0.getSession();
	if (!session?.user) {
		return { user: null, error: { error: 'Unauthorized', status: 401 } };
	}

	const user = await prisma.user.findUnique({
		where: { auth0Id: session.user.sub },
	});

	if (!user) {
		return { user: null, error: { error: 'Unauthorized', status: 404 } };
	}

	return { user, error: null };
}

export async function getServerUser() {
	const session = await auth0.getSession();
	if (!session?.user) {
		return { user: null, error: { error: 'Unauthorized', status: 401 } };
	}

	const fullUser = await prisma.user.findUnique({
		where: { auth0Id: session.user.sub },
	});

	if (!fullUser) {
		return { user: null, error: { error: 'Unauthorized', status: 404 } };
	}

	const { auth0Id, ...user } = fullUser;

	return { user, error: null };
}
