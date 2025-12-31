'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useContactsGetAll } from '@/hooks/useContact';
import ContactsTable from '@/app/components/contacts/ContactsTable';
import type { ContactFromDB, ContactsResponse } from '@/types/contactTypes';

export default function ContactsClient({
	initialContacts,
}: {
	initialContacts: ContactFromDB[];
}) {
	const queryClient = useQueryClient();

	// hydrate server data into the cache
	useEffect(() => {
		if (initialContacts) {
			queryClient.setQueryData<ContactsResponse>(['contacts-get-all'], {
				contacts: initialContacts,
			});
		}
	}, [initialContacts, queryClient]);

	const { data } = useContactsGetAll();
	const contacts = data?.contacts || [];

	return (
		<ContactsTable
			contacts={contacts}
			columns={{
				associatedRole: true,
				importance: true,
				lastActivity: true,
				linkedIn: true,
				phone: true,
				replied: true,
			}}
		/>
	);
}
