import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiUser } from '@/services/getUserService';
import { applyRateLimit } from '@/lib/rateLimit';
import { jsonAuthError, json404, json500, sanitizeUser } from '@/lib/api';

export async function GET(request: NextRequest) {
	const { user: apiUser, error } = await getApiUser();

	if (!apiUser || error) {
		return jsonAuthError(error);
	}

	const rateLimited = await applyRateLimit(apiUser.id, 'crud-read', apiUser.subscriptionTier);
	if (rateLimited) return rateLimited;

	try {
		const userFromDB = await prisma.user.findUnique({
			where: { id: apiUser.id },
			include: {
				signatures: {
					orderBy: {
						createdAt: 'asc',
					},
				},
			},
		});

		if (!userFromDB) {
			return json404('User not found');
		}

		return NextResponse.json(sanitizeUser(userFromDB));
	} catch (error) {
		console.error('Error fetching user:', error);
		return json500('Failed to fetch user');
	}
}

export async function DELETE(request: NextRequest) {
	const { user: apiUser, error } = await getApiUser();
	if (!apiUser || error) {
		return jsonAuthError(error);
	}
	const rateLimited = await applyRateLimit(apiUser.id, 'auth-action', apiUser.subscriptionTier);
	if (rateLimited) return rateLimited;

	try {
		const userToDelete = await prisma.user.findUnique({
			where: { id: apiUser.id },
			select: { auth0Id: true },
		});

		if (!userToDelete) {
			return json404('User not found');
		}

		// Delete user from database first
		await prisma.user.delete({
			where: { id: apiUser.id },
		});

		// Delete Auth0 user server-side (auth0Id never reaches the client)
		if (!userToDelete.auth0Id) {
			return NextResponse.json({ success: true });
		}

		try {
			const auth0Domain = `https://${process.env.AUTH0_ISSUER_BASE_URL}`;

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

			if (tokenRes.ok) {
				const { access_token } = await tokenRes.json();
				await fetch(
					`${auth0Domain}/api/v2/users/${encodeURIComponent(userToDelete.auth0Id)}`,
					{
						method: 'DELETE',
						headers: { Authorization: `Bearer ${access_token}` },
					},
				);
			} else {
				console.error('Failed to get Auth0 management token for user deletion');
			}
		} catch (auth0Error) {
			// Log but don't fail — the DB user is already deleted
			console.error('Error deleting Auth0 user:', auth0Error);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting user:', error);
		return json500('Failed to delete user');
	}
}
