import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { applyPublicRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
	const session = await auth0.getSession();

	if (!session || !session.user) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const rateLimited = await applyPublicRateLimit(request, 'auth-action');
	if (rateLimited) return rateLimited;

	try {
		const body = await request.json();
		const { auth0Id } = body;

		if (!auth0Id) {
			return NextResponse.json({ error: 'auth0Id required' }, { status: 400 });
		}

		// CRITICAL SECURITY CHECK: Only allow deleting your own account
		if (session.user.sub !== auth0Id) {
			console.error('Forbidden: User tried to delete different account', {
				sessionUserId: session.user.sub,
				requestedUserId: auth0Id,
			});
			return NextResponse.json(
				{ error: "Forbidden: Cannot delete another user's account" },
				{ status: 403 },
			);
		}

		// Get Auth0 domain from env
		const auth0Domain = `https://${process.env.AUTH0_ISSUER_BASE_URL}`;

		if (!auth0Domain) {
			console.error('AUTH0_ISSUER_BASE_URL not configured');
			return NextResponse.json(
				{ error: 'Auth0 configuration missing' },
				{ status: 500 },
			);
		}

		// Get Management API token
		const tokenRes = await fetch(`${auth0Domain}/oauth/token`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				client_id: process.env.AUTH0_MGMT_CLIENT_ID,
				client_secret: process.env.AUTH0_MGMT_CLIENT_SECRET,
				audience: `${auth0Domain}/api/v2/`,
				grant_type: 'client_credentials',
			}),
		});

		if (!tokenRes.ok) {
			const text = await tokenRes.text();
			console.error('Auth0 token error:', text);
			return NextResponse.json(
				{ error: 'Failed to get management token' },
				{ status: 500 },
			);
		}

		const { access_token } = await tokenRes.json();

		// Delete the Auth0 user
		const deleteRes = await fetch(
			`${auth0Domain}/api/v2/users/${encodeURIComponent(auth0Id)}`,
			{
				method: 'DELETE',
				headers: { Authorization: `Bearer ${access_token}` },
			},
		);

		if (!deleteRes.ok) {
			const text = await deleteRes.text();
			console.error('Auth0 delete error:', deleteRes.status, text);
			return NextResponse.json(
				{ error: 'Failed to delete Auth0 user' },
				{ status: 500 },
			);
		}

		return NextResponse.json({ success: true });
	} catch (err) {
		console.error('delete-auth0-user route error:', err);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}
