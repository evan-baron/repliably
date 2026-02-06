import { userAPI } from '@/services/api';

// Tanstack React Query
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Types imports
import { UserToClientFromDB } from '@/types/userTypes';

// Context imports

export const useSaveSignature = () => {
	const queryClient = useQueryClient();

	return useMutation<
		UserToClientFromDB,
		Error,
		{ emailSignature: { name: string; isDefault: boolean; content: string } }
	>({
		mutationFn: ({ emailSignature }) => userAPI.saveSignature(emailSignature),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user-get'] });
		},
		onError: (error) => {
			console.error('Error saving signature:', error);
		},
	});
};

export const useDeleteSignature = () => {
	const queryClient = useQueryClient();

	return useMutation<void, Error, number>({
		mutationFn: userAPI.deleteSignature,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user-get'] });
		},
		onError: (error) => {
			console.error('Error deleting signature:', error);
		},
	});
};

export const useUpdateSignature = () => {
	const queryClient = useQueryClient();

	return useMutation<
		void,
		Error,
		{
			signatureId: number;
			emailSignature: { name?: string; isDefault?: boolean; content?: string };
		}
	>({
		mutationFn: ({ signatureId, emailSignature }) =>
			userAPI.updateSignature(signatureId, emailSignature),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user-get'] });
		},
		onError: (error) => {
			console.error('Error updating signature:', error);
		},
	});
};
