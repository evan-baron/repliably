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
			console.log('Deleting user account...');

			const { auth0Id } = await userAPI.deleteUser();

			console.log('delete result auth0Id:', auth0Id);

			if (auth0Id) {
				console.log('Attempting to delete Auth0 user with ID:', auth0Id);
				try {
					await userAPI.deleteAuth0User(auth0Id);
					console.log('Auth0 user deleted successfully');
				} catch (error) {
					console.error('Error deleting Auth0 user:', error);
				}
			}
		},
		onSuccess: () => {
			console.log(
				'User account deleted successfully, clearing cache and redirecting...',
			);
			queryClient.clear();

			setModalType(null);

			console.log('Redirecting to homepage after account deletion');
			const returnUrl = window.location.origin;
			console.log('Redirecting to homepage after account deletion');
			window.location.href = `/auth/logout?returnTo=${encodeURIComponent(returnUrl)}`;
		},
		onError: (error) => {
			console.error('Error deleting user account:', error);
		},
	});
};
