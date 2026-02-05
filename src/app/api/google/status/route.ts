import { NextResponse } from 'next/server';
import { getGmailConnectionStatus } from '@/lib/googleOAuth';
import { getApiUser } from '@/services/getUserService';

export async function GET() {
	try {
		const { user, error } = await getApiUser();
		if (error) {
			return NextResponse.json(
				{ error: error.error },
				{ status: error.status }
			);
		}

		const status = await getGmailConnectionStatus(user.id);

		return NextResponse.json(status);
	} catch (error) {
		console.error('Error getting Gmail status:', error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
}
