import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/services/getUserService';
import { prisma } from '@/lib/prisma';
import { applyRateLimit } from '@/lib/rateLimit';
import { jsonAuthError, json400, json500, sanitizeContact, sanitizeContacts } from '@/lib/api';

export async function GET(req: NextRequest) {
	try {
		const { user, error } = await getApiUser();
		if (error) return jsonAuthError(error);

		const rateLimited = await applyRateLimit(user.id, 'crud-read', user.subscriptionTier);
		if (rateLimited) return rateLimited;

		const contacts = await prisma.contact.findMany({
			where: { ownerId: user.id },
		});

		return NextResponse.json({ contacts: sanitizeContacts(contacts) });
	} catch (error) {
		console.error('Error fetching contacts:', error);
		return json500('Failed to fetch contacts');
	}
}

export async function POST(req: NextRequest) {
	try {
		const { user, error } = await getApiUser();
		if (error) return jsonAuthError(error);

		const rateLimited = await applyRateLimit(user.id, 'contacts-write', user.subscriptionTier);
		if (rateLimited) return rateLimited;

		const {
			firstName,
			lastName,
			company,
			title,
			email,
			phone,
			linkedIn,
			importance,
			reasonForEmail,
		} = await req.json();

		if (!firstName || !lastName || !email) {
			return json400('Missing required fields: firstName, lastName, email');
		}

		const existingContact = await prisma.contact.findFirst({
			where: {
				ownerId: user.id,
				email: email,
			},
		});

		if (existingContact) {
			const isIdentical =
				existingContact.firstName === firstName &&
				existingContact.lastName === lastName &&
				existingContact.company === (company || null) &&
				existingContact.title === (title || null) &&
				existingContact.email === email &&
				existingContact.phone === (phone || null) &&
				existingContact.linkedIn === (linkedIn || null) &&
				existingContact.importance === parseInt(importance) &&
				existingContact.reasonForEmail === (reasonForEmail || null);

			if (isIdentical) {
				return NextResponse.json({
					success: true,
					contact: sanitizeContact(existingContact),
				});
			}

			return NextResponse.json({
				success: false,
				duplicate: true,
				existingContact: sanitizeContact(existingContact),
				submittedData: {
					firstName,
					lastName,
					company: company || null,
					title: title || null,
					email,
					phone: phone || null,
					linkedIn: linkedIn || null,
					importance: parseInt(importance),
					reasonForEmail: reasonForEmail || null,
				},
			});
		}

		const contact = await prisma.contact.create({
			data: {
				ownerId: user.id,
				firstName: firstName,
				lastName: lastName,
				company: company || null,
				title: title || null,
				email,
				phone: phone || null,
				linkedIn: linkedIn || null,
				importance: parseInt(importance),
				reasonForEmail: reasonForEmail || null,
			},
		});

		return NextResponse.json({
			success: true,
			contact: sanitizeContact(contact),
		});
	} catch (error) {
		console.error('Contact creation error:', error);
		return json500('Failed to create contact');
	}
}
