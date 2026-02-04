import { userAPI } from '@/services/api';

// Tanstack React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types imports
import { UserFromDB } from '@/types/userTypes';

export const useUser = () => {
	return useQuery<UserFromDB>({
		queryKey: ['user-get'],
		queryFn: () => userAPI.getUser(),
	});
};
