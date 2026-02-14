import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiUser } from '@/services/getUserService';
import { applyRateLimit } from '@/lib/rateLimit';
import { signatureSchema } from '@/lib/validation';
import { z } from 'zod';
import { jsonAuthError, json400, json404, json500, jsonValidationError } from '@/lib/api';

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { user, error } = await getApiUser();
		if (error) return jsonAuthError(error);

		if (!user) {
			return json404('User not found');
		}

		const rateLimited = await applyRateLimit(user.id, 'crud-write', user.subscriptionTier);
		if (rateLimited) return rateLimited;

		const { id } = await params;

		const signatureId = parseInt(id, 10);

		if (isNaN(signatureId) || signatureId <= 0) {
			return json400('Invalid signature ID');
		}

		const { emailSignature } = await request.json();

		try {
			const validatedData = signatureSchema.parse(emailSignature);

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

			const signature = await prisma.userSignature.findFirst({
				where: { id: signatureId, userId: user.id },
			});

			if (!signature) {
				return json404('Signature not found');
			}

			if (updateData.isDefault) {
				await prisma.userSignature.updateMany({
					where: { userId: user.id, isDefault: true },
					data: { isDefault: false },
				});
			}

			await prisma.userSignature.update({
				where: { id: signatureId },
				data: updateData,
			});

			return NextResponse.json({ success: true });
		} catch (validationError) {
			if (validationError instanceof z.ZodError) {
				return jsonValidationError(validationError);
			}
			throw validationError;
		}
	} catch (error) {
		console.error('Error updating signature:', error);
		return json500('Failed to update signature');
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { user, error } = await getApiUser();
		if (error) return jsonAuthError(error);

		if (!user) {
			return json404('User not found');
		}

		const rateLimited = await applyRateLimit(user.id, 'crud-write', user.subscriptionTier);
		if (rateLimited) return rateLimited;

		const { id } = await params;

		const signatureId = parseInt(id, 10);

		if (isNaN(signatureId) || signatureId <= 0) {
			return json400('Invalid signature ID');
		}

		const signature = await prisma.userSignature.findFirst({
			where: { id: signatureId, userId: user.id },
		});

		if (!signature) {
			return json404('Signature not found');
		}

		await prisma.userSignature.delete({
			where: { id: signatureId },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting signature:', error);
		return json500('Failed to delete signature');
	}
}
