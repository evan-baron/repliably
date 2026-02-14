import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiUser } from '@/services/getUserService';
import { applyRateLimit } from '@/lib/rateLimit';
import { jsonAuthError, json400, json404, json500, sanitizeContact } from '@/lib/api';

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { user, error } = await getApiUser();
		if (error) return jsonAuthError(error);

		const rateLimited = await applyRateLimit(user.id, 'crud-read', user.subscriptionTier);
		if (rateLimited) return rateLimited;

		const { id } = await params;
		const contactId = parseInt(id);
		const contact = await prisma.contact.findUnique({
			where: { id: contactId, ownerId: user.id },
		});
		if (!contact) {
			return json404('Contact not found');
		}
		return NextResponse.json(sanitizeContact(contact));
	} catch (error) {
		console.error('Error fetching contact:', error);
		return json500('Failed to fetch contact');
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { user, error } = await getApiUser();
		if (error) return jsonAuthError(error);

		const rateLimited = await applyRateLimit(user.id, 'crud-write', user.subscriptionTier);
		if (rateLimited) return rateLimited;

		const { id } = await params;
		const contactId = parseInt(id);
		const body = await request.json();

		const { id: bodyId, ...updateData } = body;

		if (updateData.importance !== undefined && updateData.importance !== '') {
			updateData.importance = parseInt(updateData.importance);
		} else {
			updateData.importance = null;
		}

		const existingContact = await prisma.contact.findUnique({
			where: {
				id: contactId,
			},
		});

		if (!existingContact || existingContact.ownerId !== user.id) {
			return json404('Contact not found');
		}

		if (updateData.email && updateData.email !== existingContact.email) {
			const emailConflict = await prisma.contact.findFirst({
				where: {
					ownerId: user.id,
					email: updateData.email,
					id: { not: contactId },
				},
			});

			if (emailConflict) {
				return json400('Contact with this email already exists');
			}
		}

		const emailChanged = existingContact.email !== updateData.email;

		const updatedContact = await prisma.contact.update({
			where: { id: contactId },
			data: {
				...updateData,
				validEmail: emailChanged ? null : existingContact.validEmail,
			},
		});

		return NextResponse.json({
			success: true,
			contact: sanitizeContact(updatedContact),
		});
	} catch (error) {
		console.error('Error updating contact:', error);
		return json500('Failed to update contact');
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { user, error } = await getApiUser();
		if (error) return jsonAuthError(error);

		const rateLimited = await applyRateLimit(user.id, 'crud-write', user.subscriptionTier);
		if (rateLimited) return rateLimited;

		const { id } = await params;

		const contactId = parseInt(id);

		await prisma.contact.delete({
			where: { id: contactId, ownerId: user.id },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting contact:', error);
		return json500('Failed to delete contact');
	}
}
