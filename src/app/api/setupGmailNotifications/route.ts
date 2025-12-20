import { NextRequest, NextResponse } from 'next/server';
import { setupGmailNotifications } from '@/lib/setupGmailNotifications';

export async function POST(req: NextRequest) {
	try {
		const result = await setupGmailNotifications();
		return NextResponse.json({ success: true, data: result });
	} catch (error: any) {
		console.error('Setup error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
