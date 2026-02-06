import { userAPI } from '@/services/api';
import { redirect } from 'next/navigation';

// Tanstack React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types imports
import { UserFromDB } from '@/types/userTypes';

// Context imports
import { useAppContext } from '@/app/context/AppContext';

export const useGetUser = () => {
	return useQuery<UserFromDB>({
		queryKey: ['user-get'],
		queryFn: () => userAPI.getUser(),
	});
};

export const useUserAccountSettingsUpdate = () => {
	const queryClient = useQueryClient();

	return useMutation<UserFromDB, Error, Partial<UserFromDB>>({
		mutationFn: (updateData) => userAPI.updateAccountSettings(updateData),

		onSuccess: (updatedUser) => {
			// Update the user data in the cache with the updated user data
			queryClient.setQueryData<UserFromDB>(['user-get'], updatedUser);
		},

		onError: (error) => {
			console.error('Error updating user account settings:', error);
		},

		onSettled: () => {
			// Invalidate the user query to refetch the latest data from the server
			queryClient.invalidateQueries({ queryKey: ['user-get'] });
		},
	});
};

export const useDeleteUser = () => {
	const { setModalType } = useAppContext();
	const queryClient = useQueryClient();
	return useMutation<void, Error>({
		mutationFn: () => userAPI.deleteUser(),
		onSuccess: () => {
			// Clear user data from cache on successful deletion
			queryClient.invalidateQueries({
				predicate: (query) =>
					[
						'user-get',
						'contacts-get-all',
						'all-messages-by-contact-id',
						'pending-messages-get-all',
						'all-messages-by-contact-id',
						'messages-get-by-contact',
						'sequences-get-by-contact',
					].includes(query.queryKey[0] as string),
			});
			setModalType(null);
			redirect('/');
		},
		onError: (error) => {
			console.error('Error deleting user account:', error);
		},
	});
};
