import { userAPI } from '@/services/api';

// Tanstack React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types imports
import { UserFromDB } from '@/types/userTypes';

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
