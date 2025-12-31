import { contactAPI } from '@/services/api';
import { useAppContext } from '@/app/context/AppContext';
import {
	ContactData,
	ContactResponse,
	ContactsResponse,
	ContactUpdateData,
} from '@/types/contactTypes';

// Tanstack React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useContactsGetAll = () => {
	return useQuery<ContactsResponse>({
		queryKey: ['contacts-get-all'],
		queryFn: contactAPI.read,
	});
};

type CreateContext = {
	previous?: ContactsResponse | undefined;
	tempId?: number | string;
};

export const useContactCreate = () => {
	const { setDuplicateContact } = useAppContext();
	const queryClient = useQueryClient();

	return useMutation<ContactResponse, Error, ContactData, CreateContext>({
		mutationFn: contactAPI.create,

		onMutate: async (newContactData: ContactData) => {
			await queryClient.cancelQueries({ queryKey: ['contacts-get-all'] });

			const previousContacts = queryClient.getQueryData<ContactsResponse>([
				'contacts-get-all',
			]);

			const tempId = `temp-${Date.now()}`;
			const optimisticContact = {
				id: tempId,
				ownerId: -1,
				firstName: newContactData.firstName || null,
				lastName: newContactData.lastName || null,
				company: newContactData.company || null,
				title: newContactData.title || null,
				email: newContactData.email,
				phone: newContactData.phone || null,
				linkedIn: newContactData.linkedIn || null,
				importance: newContactData.importance || null,
				associatedRole: newContactData.associatedRole || null,
				active: true,
				lastActivity: null,
				replied: false,
				validEmail: null,
				createdAt: new Date(),
				updatedAt: new Date(),
				autoCreated: false,
			};

			queryClient.setQueryData<ContactsResponse>(
				['contacts-get-all'],
				(old) => {
					const prev = old?.contacts || [];
					return {
						contacts: [optimisticContact, ...prev],
					};
				}
			);

			return { previous: previousContacts, tempId };
		},

		onError: (error: Error, _contactData: ContactData, context: any) => {
			console.error('Failed to create contact:', error);
			// Roll back to previous cache state (undo optimistic insert)
			if (context?.previous) {
				queryClient.setQueryData(['contacts-get-all'], context.previous);
			}
			alert(`Failed to create contact: ${error.message}`);
		},

		onSuccess: (
			response: ContactResponse,
			_contactData: ContactData,
			context: any
		) => {
			// If API reports duplicate, set duplicate mode and replace temp entry with existingContact if provided
			if (response.success === false && response.duplicate) {
				setDuplicateContact(true);
				if (response.existingContact) {
					queryClient.setQueryData(['contacts-get-all'], (old: any) => {
						const prev = old?.contacts || [];
						return {
							contacts: prev.map((c: any) =>
								c.id === context?.tempId ? response.existingContact : c
							),
						};
					});
				} else {
					// remove optimistic entry if you prefer
					if (context?.previous)
						queryClient.setQueryData(['contacts-get-all'], context.previous);
				}
				return;
			}

			// Normal success: replace optimistic item (by tempId) with server contact
			if (response?.contact) {
				queryClient.setQueryData<ContactsResponse>(
					['contacts-get-all'],
					(old: any) => {
						const prev = old?.contacts || [];
						return {
							contacts: prev.map((c: any) =>
								c.id === context?.tempId ? response.contact : c
							),
						};
					}
				);
			} else {
				// If server only returns contact id or similar, simply invalidate to refetch authoritative data
				queryClient.invalidateQueries({ queryKey: ['contacts-get-all'] });
			}

			alert(
				`Contact created successfully! ${response.contact.firstName} ${response.contact.lastName}`
			);
		},

		onSettled: () => {
			// Ensure eventual consistency
			queryClient.invalidateQueries({ queryKey: ['contacts-get-all'] });
		},
	});
};

export const useContactUpdate = () => {
	const { setDuplicateContact } = useAppContext();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: contactAPI.update,
		onSuccess: (response: ContactResponse, contactData: ContactUpdateData) => {
			setDuplicateContact(false);
			queryClient.invalidateQueries({ queryKey: ['contacts-get-all'] });
			alert(
				`Contact updated successfully! ${response.contact.firstName} ${response.contact.lastName}`
			);
		},
		onError: (error: Error, contactData: ContactUpdateData) => {
			console.error('Failed to update contact:', error);
			alert(`Failed to update contact: ${error.message}`);
		},
	});
};
