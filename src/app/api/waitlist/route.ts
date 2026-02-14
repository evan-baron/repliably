import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { waitlistEmailSchema } from '@/lib/validation';
import { applyPublicRateLimit } from '@/lib/rateLimit';
import { z } from 'zod';

export async function POST(req: NextRequest) {
	try {
		const rateLimited = await applyPublicRateLimit(req, 'waitlist');
		if (rateLimited) return rateLimited;

		const body = await req.json();

		const parseResult = waitlistEmailSchema.safeParse(body);

		if (!parseResult.success) {
			return NextResponse.json(
				{ error: parseResult.error.message },
				{ status: 400 },
			);
		}

		const { email } = parseResult.data;

		// Check if the email is already in the waitlist
		const existingEntry = await prisma.waitlist.findUnique({
			where: { email },
		});

		if (existingEntry) {
			return NextResponse.json(
				{ success: 'Email is already in the waitlist', duplicate: true },
				{ status: 201 },
			);
		}

		// Add the email to the waitlist
		await prisma.waitlist.create({
			data: { email },
		});

		return NextResponse.json({ success: true });
	} catch (error: any) {
		console.error('Waitlist error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
