import { NextRequest, NextResponse } from 'next/server';
import Pusher from 'pusher';
import { getApiUser } from '@/services/getUserService';
import { applyRateLimit } from '@/lib/rateLimit';

const pusher = new Pusher({
	appId: process.env.PUSHER_APP_ID!,
	key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
	secret: process.env.PUSHER_SECRET!,
	cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
	useTLS: true,
});

export async function POST(req: NextRequest) {
	try {
		const { user, error } = await getApiUser();
		if (error) {
			return NextResponse.json(
				{ error: error.error },
				{ status: error.status },
			);
		}

		const rateLimited = await applyRateLimit(user.id, 'crud-write', user.subscriptionTier);
		if (rateLimited) return rateLimited;

		const body = await req.formData();
		const socketId = body.get('socket_id') as string;
		const channel = body.get('channel_name') as string;

		// Ensure the user can only subscribe to their own channel
		if (channel !== `private-user-${user.id}`) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		const authResponse = pusher.authorizeChannel(socketId, channel);

		return NextResponse.json(authResponse);
	} catch (error: any) {
		console.error('Pusher auth error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
