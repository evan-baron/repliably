import { NextRequest, NextResponse } from 'next/server';
import { setupGmailNotifications } from '@/lib/setupGmailNotifications';
import { getApiUser } from '@/services/getUserService';

export async function POST(req: NextRequest) {
	const { user, error: authError } = await getApiUser();
	if (authError || !user) {
		return NextResponse.json(
			{ success: false, error: 'Unauthorized' },
			{ status: 401 },
		);
	}

	try {
		const result = await setupGmailNotifications();
		return NextResponse.json({ success: true, data: result });
	} catch (error: any) {
		console.error('Setup error:', error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 },
		);
	}
}
