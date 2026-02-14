import { NextRequest, NextResponse } from 'next/server';
import { runGenerateNextMessages } from './generate-next-messages/handler';
import { runUpdatePendingMessages } from './update-pending-messages/handler';
import { runSendScheduledMessages } from './send-scheduled-messages/handler';
import { cleanupExpiredRateLimits } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
	try {
		const cronSecret = process.env.CRON_SECRET;
		if (!cronSecret) {
			console.error('CRON_SECRET is not set in environment variables');
			return NextResponse.json(
				{ error: 'Server configuration error' },
				{ status: 500 },
			);
		}

		const authHeader = req.headers.get('authorization');
		if (!authHeader) {
			console.warn('Cron request missing authorization header');
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const [generate, update, send, rateLimitCleanup] =
			await Promise.allSettled([
				runGenerateNextMessages({ limit: 50 }),
				runUpdatePendingMessages({ limit: 50 }),
				runSendScheduledMessages({ limit: 50 }),
				cleanupExpiredRateLimits(),
			]);

		// ✅ Check for any handler failures
		const hasFailures = [generate, update, send].some(
			(result) => result.status === 'rejected',
		);

		// ✅ Log individual handler results
		const results = {
			generate:
				generate.status === 'fulfilled' ?
					generate.value
				:	{
						success: false,
						error: (generate.reason as Error)?.message || 'Unknown error',
					},
			update:
				update.status === 'fulfilled' ?
					update.value
				:	{
						success: false,
						error: (update.reason as Error)?.message || 'Unknown error',
					},
			send:
				send.status === 'fulfilled' ?
					send.value
				:	{
						success: false,
						error: (send.reason as Error)?.message || 'Unknown error',
					},
			rateLimitCleanup:
				rateLimitCleanup.status === 'fulfilled' ?
					{ success: true, deleted: rateLimitCleanup.value }
				:	{
						success: false,
						error:
							(rateLimitCleanup.reason as Error)?.message || 'Unknown error',
					},
		};

		console.log(`[${new Date().toISOString()}] Cron orchestrator completed:`, {
			generate: results.generate.success,
			update: results.update.success,
			send: results.send.success,
			rateLimitCleanup: results.rateLimitCleanup.success,
		});

		return NextResponse.json({
			success: true,
			results: results,
		});
	} catch (err: any) {
		console.error('Orchestrator error:', err);
		return NextResponse.json(
			{
				success: false,
				error: err.message || 'Unknown error',
				timestamp: new Date().toISOString(),
			},
			{ status: 500 },
		);
	}
}
