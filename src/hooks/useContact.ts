import { useMutation } from './api';
import { contactAPI } from '@/services/api';
import { useAppContext } from '@/app/context/AppContext';

interface ContactData {
	firstName: string;
	lastName: string;
	company?: string;
	title?: string;
	email: string;
	phone?: string;
	linkedIn?: string;
	importance?: string;
	associatedRole?: string;
}

interface ContactResponse {
	success: boolean;
	duplicate?: boolean;
	existingContact?: {
		id: number;
		firstName: string;
		lastName: string;
		company: string;
		title: string;
		email: string;
		phone: string;
		linkedIn: string;
		importance: number;
		associatedRole: string;
	};
	contact: {
		id: number;
		firstName: string;
		lastName: string;
		company?: string;
		title?: string;
		email: string;
		phone?: string;
		linkedIn?: string;
		importance?: number;
		associatedRole?: string;
		createdAt: string;
		updatedAt: string;
	};
}

interface ContactUpdateData {
	id: number;
	firstName?: string;
	lastName?: string;
	company?: string;
	title?: string;
	email?: string;
	phone?: string;
	linkedIn?: string;
	importance?: string;
	associatedRole?: string;
}

export const useContactCreate = () => {
	const { setDuplicateContact } = useAppContext();

	return useMutation<ContactResponse, ContactData>(contactAPI.create, {
		onSuccess: (response, contactData) => {
			if (response.success === false && response.duplicate) {
				setDuplicateContact(true);
				return;
			}

			console.log('Contact created successfully:', response.contact);
			alert(
				`Contact created successfully! ${response.contact.firstName} ${response.contact.lastName}`
			);
		},
		onError: (error, contactData) => {
			console.error('Failed to create contact:', error);
			alert(`Failed to create contact: ${error.message}`);
		},
	});
};

export const useContactUpdate = () => {
	const { setDuplicateContact } = useAppContext();

	return useMutation<ContactResponse, ContactUpdateData>(contactAPI.update, {
		onSuccess: (response, contactData) => {
			setDuplicateContact(false);
			console.log('Contact updated successfully:', response.contact);
			alert(
				`Contact updated successfully! ${response.contact.firstName} ${response.contact.lastName}`
			);
		},
		onError: (error, contactData) => {
			console.error('Failed to update contact:', error);
			alert(`Failed to update contact: ${error.message}`);
		},
	});
};
