import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiUser } from '@/services/getUserService';

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

		const { id } = await params;

		const signatureId = parseInt(id);

		if (!signatureId) {
			return NextResponse.json(
				{ error: 'Signature ID is required' },
				{ status: 400 },
			);
		}

		const { emailSignature } = await request.json();

		const { name, content, isDefault } = emailSignature;

		// If any of the above are null, proceed to update only the provided fields
		const updateData: {
			name?: string;
			content?: string;
			isDefault?: boolean;
		} = {};

		if (name !== undefined) updateData.name = name;
		if (content !== undefined) updateData.content = content;
		if (isDefault !== undefined) updateData.isDefault = isDefault;

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

		if (signature.userId !== user.id) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

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
	} catch (error) {
		console.error('Error deleting signature:', error);
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

		const { id } = await params;

		const signatureId = parseInt(id);

		if (!signatureId) {
			return NextResponse.json(
				{ error: 'Signature ID is required' },
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

		if (signature.userId !== user.id) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

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
