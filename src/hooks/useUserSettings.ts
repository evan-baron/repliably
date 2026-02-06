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
		mutationFn: async () => {
			const { auth0Id } = await userAPI.deleteUser();

			if (auth0Id) {
				try {
					await userAPI.deleteAuth0User(auth0Id);
				} catch (error) {
					console.error('Error deleting Auth0 user:', error);
				}
			}
		},
		onSuccess: () => {
			queryClient.clear();

			setModalType(null);

			const returnUrl = window.location.origin;
			window.location.href = `/auth/logout?returnTo=${encodeURIComponent(returnUrl)}`;
		},
		onError: (error) => {
			console.error('Error deleting user account:', error);
		},
	});
};
