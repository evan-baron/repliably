import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth0 } from '@/lib/auth0';

export async function GET(req: NextRequest) {
	try {
		const session = await auth0.getSession();

		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const user = await prisma.user.findUnique({
			where: { auth0Id: session.user.sub },
		});

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		const replies = await prisma.emailReply.findMany({
			where: {
				ownerId: user.id,
			},
			include: {
				contact: true, // Include contact details
			},
			orderBy: {
				replyDate: 'desc',
			},
		});

		return NextResponse.json(replies);
	} catch (error: any) {
		console.error('Error fetching replies:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
