import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiUser } from '@/services/getUserService';

export async function PUT(request: NextRequest) {
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

		const { firstName, lastName, timezone } = body.updateData;

		// Server-side validation
		const nameRegex = /^[a-zA-Z\s'-]+$/;

		if (
			!firstName ||
			typeof firstName !== 'string' ||
			firstName.trim().length < 1 ||
			firstName.length > 50
		) {
			return NextResponse.json(
				{ error: 'Invalid first name' },
				{ status: 400 },
			);
		}

		if (
			!lastName ||
			typeof lastName !== 'string' ||
			lastName.trim().length < 1 ||
			lastName.length > 50
		) {
			return NextResponse.json({ error: 'Invalid last name' }, { status: 400 });
		}

		if (!nameRegex.test(firstName.trim())) {
			return NextResponse.json(
				{ error: 'First name contains invalid characters' },
				{ status: 400 },
			);
		}

		if (!nameRegex.test(lastName.trim())) {
			return NextResponse.json(
				{ error: 'Last name contains invalid characters' },
				{ status: 400 },
			);
		}

		// VALIDATE TIMEZONE - whitelist approach
		const validTimezones = Intl.supportedValuesOf('timeZone');
		if (
			!timezone ||
			typeof timezone !== 'string' ||
			!validTimezones.includes(timezone)
		) {
			return NextResponse.json({ error: 'Invalid timezone' }, { status: 400 });
		}

		// Sanitize inputs
		const sanitizedData = {
			firstName: firstName.trim().replace(/[<>"/;`%]/g, ''),
			lastName: lastName.trim().replace(/[<>"/;`%]/g, ''),
			timezone: timezone,
		};

		const updatedUser = await prisma.user.update({
			where: { id: user.id },
			data: sanitizedData,
		});

		return NextResponse.json({ success: true, user: updatedUser });
	} catch (error) {
		console.error('Error updating user:', error);
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
			{ success: false, error: 'Failed to update user' },
			{ status: 500 },
		);
	}
}
