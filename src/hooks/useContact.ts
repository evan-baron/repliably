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

export const useContactCreate = () => {
	const { setDuplicateContact } = useAppContext();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: contactAPI.create,
		onSuccess: (response: ContactResponse, contactData: ContactData) => {
			if (response.success === false && response.duplicate) {
				setDuplicateContact(true);
				return;
			}

			// Update the cached contacts list so the table updates immediately
			queryClient.setQueryData(['contacts-get-all'], (old: any) => {
				const prev = old?.contacts || [];
				return { contacts: [response.contact, ...prev] };
			});

			// Also invalidate to ensure server truth eventually
			queryClient.invalidateQueries({ queryKey: ['contacts-get-all'] });

			alert(
				`Contact created successfully! ${response.contact.firstName} ${response.contact.lastName}`
			);
		},
		onError: (error: Error, contactData: ContactData) => {
			console.error('Failed to create contact:', error);
			alert(`Failed to create contact: ${error.message}`);
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
