import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiUser } from '@/services/getUserService';

export async function POST(request: NextRequest) {
	try {
		const { user, error } = await getApiUser();
		if (error) {
			return NextResponse.json(
				{ error: error.error },
				{ status: error.status },
			);
		}

		if (!user) {
			return NextResponse.json(
				{ error: 'User not authenticated' },
				{ status: 401 },
			);
		}

		const body = await request.json();

		const { emailSignature } = body;

		const updatedUser = await prisma.userSignature.create({
			data: {
				userId: user.id,
				...emailSignature,
			},
		});

		return NextResponse.json({ success: true, user: updatedUser });
	} catch (error) {
		console.error('Error saving signature:', error);
		let message = 'Unknown error';
		let stack = undefined;
		if (error instanceof Error) {
			message = error.message;
			stack = error.stack;
		}
		console.error('Error details:', {
			message,
			stack,
		});
		return NextResponse.json(
			{ success: false, error: 'Failed to save signature' },
			{ status: 500 },
		);
	}
}
