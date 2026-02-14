import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiUser } from '@/services/getUserService';
import { applyRateLimit } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
	const { user: apiUser, error } = await getApiUser();

	if (!apiUser || error) {
		return NextResponse.json({ error: error.error }, { status: error.status });
	}

	const rateLimited = await applyRateLimit(apiUser.id, 'crud-read', apiUser.subscriptionTier);
	if (rateLimited) return rateLimited;

	try {
		const userFromDB = await prisma.user.findUnique({
			where: { id: apiUser.id },
			include: {
				signatures: {
					orderBy: {
						createdAt: 'asc',
					},
				},
			},
		});

		if (!userFromDB) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		const { auth0Id, gmailRefreshToken, ...user } = userFromDB;

		return NextResponse.json(user);
	} catch (error) {
		console.error('Error fetching user:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch user' },
			{ status: 500 },
		);
	}
}

export async function DELETE(request: NextRequest) {
	const { user: apiUser, error } = await getApiUser();
	if (!apiUser || error) {
		return NextResponse.json({ error: error.error }, { status: error.status });
	}
	const rateLimited = await applyRateLimit(apiUser.id, 'auth-action', apiUser.subscriptionTier);
	if (rateLimited) return rateLimited;

	try {
		const userToDelete = await prisma.user.findUnique({
			where: { id: apiUser.id },
			select: { auth0Id: true },
		});

		if (!userToDelete) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		await prisma.user.delete({
			where: { id: apiUser.id },
		});

		return NextResponse.json({ success: true, auth0Id: userToDelete.auth0Id });
	} catch (error) {
		console.error('Error deleting user:', error);
		return NextResponse.json(
			{ success: false, error: 'Failed to delete user' },
			{ status: 500 },
		);
	}
}
