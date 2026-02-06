import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiUser } from '@/services/getUserService';

export async function GET(request: NextRequest) {
	const { user: apiUser, error } = await getApiUser();

	if (!apiUser || error) {
		return NextResponse.json({ error: error.error }, { status: error.status });
	}

	try {
		const userFromDB = await prisma.user.findUnique({
			where: { id: apiUser.id },
		});

		if (!userFromDB) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		const { auth0Id, ...user } = userFromDB;

		return NextResponse.json(user);
	} catch (error) {
		console.error('Error fetching user:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch user' },
			{ status: 500 },
		);
	}
}

export async function PUT(request: NextRequest) {
	const { user: apiUser, error } = await getApiUser();
	if (!apiUser || error) {
		return NextResponse.json({ error: error.error }, { status: error.status });
	}

	try {
		await prisma.$transaction(async (prisma) => {
			// Deactivate all sequences associated with the user
			await prisma.sequence.updateMany({
				where: { ownerId: apiUser.id },
				data: { active: false },
			});

			// Deactivate all contacts associated with the user
			await prisma.contact.updateMany({
				where: { ownerId: apiUser.id },
				data: { active: false },
			});

			// Delete any pending or scheduled messages associated with the user
			await prisma.message.deleteMany({
				where: {
					contact: {
						ownerId: apiUser.id,
					},
					OR: [{ status: 'pending' }, { status: 'scheduled' }],
				},
			});

			// Finally, deactivate the user account
			await prisma.user.update({
				where: { id: apiUser.id },
				data: { active: false },
			});
		});
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting user:', error);
		return NextResponse.json(
			{ success: false, error: 'Failed to delete user' },
			{ status: 500 },
		);
	}
}
