import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiUser } from '@/services/getUserService';
import { applyRateLimit } from '@/lib/rateLimit';
import { signatureSchema } from '@/lib/validation';
import { z } from 'zod';

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { user, error } = await getApiUser();
		if (error) {
			return NextResponse.json(
				{ error: error.error },
				{ status: error.status },
			);
		}

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		const rateLimited = await applyRateLimit(user.id, 'crud-write', user.subscriptionTier);
		if (rateLimited) return rateLimited;

		const { id } = await params;

		// Validate signature ID
		const signatureId = parseInt(id, 10);

		if (isNaN(signatureId) || signatureId <= 0) {
			return NextResponse.json(
				{ error: 'Invalid signature ID' },
				{ status: 400 },
			);
		}

		const { emailSignature } = await request.json();

		// Validate input using Zod schema
		try {
			const validatedData = signatureSchema.parse(emailSignature);

			// Remove undefined values (only update fields that were provided)
			const updateData: {
				name?: string;
				content?: string;
				isDefault?: boolean;
			} = {};

			if (validatedData.name !== undefined)
				updateData.name = validatedData.name;
			if (validatedData.content !== undefined)
				updateData.content = validatedData.content;
			if (validatedData.isDefault !== undefined) {
				updateData.isDefault = Boolean(validatedData.isDefault);
			}

			// Verify the signature belongs to this user
			const signature = await prisma.userSignature.findFirst({
				where: { id: signatureId, userId: user.id },
			});

			if (!signature) {
				return NextResponse.json(
					{ error: 'Signature not found' },
					{ status: 404 },
				);
			}

			// No need to check userId again - findFirst already filtered by userId
			// if (signature.userId !== user.id) { ... } // Redundant

			// If isDefault is being set to true, unset the current default signature
			if (updateData.isDefault) {
				await prisma.userSignature.updateMany({
					where: { userId: user.id, isDefault: true },
					data: { isDefault: false },
				});
			}

			// Update the signature
			await prisma.userSignature.update({
				where: { id: signatureId },
				data: updateData,
			});

			return NextResponse.json({ success: true });
		} catch (validationError) {
			if (validationError instanceof z.ZodError) {
				const errors = validationError.issues.map((issue) => ({
					path: issue.path.join('.'),
					message: issue.message,
				}));
				return NextResponse.json(
					{
						error: 'Validation failed',
						details: errors.map((e) => e.message),
						fields: errors,
					},
					{ status: 400 },
				);
			}
			throw validationError;
		}
	} catch (error) {
		console.error('Error updating signature:', error);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { user, error } = await getApiUser();
		if (error) {
			return NextResponse.json(
				{ error: error.error },
				{ status: error.status },
			);
		}

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		const rateLimited = await applyRateLimit(user.id, 'crud-write', user.subscriptionTier);
		if (rateLimited) return rateLimited;

		const { id } = await params;

		// Validate signature ID
		const signatureId = parseInt(id, 10);

		if (isNaN(signatureId) || signatureId <= 0) {
			return NextResponse.json(
				{ error: 'Invalid signature ID' },
				{ status: 400 },
			);
		}

		// Verify the signature belongs to this user
		const signature = await prisma.userSignature.findFirst({
			where: { id: signatureId, userId: user.id },
		});

		if (!signature) {
			return NextResponse.json(
				{ error: 'Signature not found' },
				{ status: 404 },
			);
		}

		// No need to check userId again - findFirst already filtered by userId
		// if (signature.userId !== user.id) { ... } // Redundant

		// Delete the signature
		await prisma.userSignature.delete({
			where: { id: signatureId },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting signature:', error);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}
