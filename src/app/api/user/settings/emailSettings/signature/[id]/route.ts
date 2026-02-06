import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiUser } from '@/services/getUserService';

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
