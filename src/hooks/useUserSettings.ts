import { userAPI } from '@/services/api';
import { redirect } from 'next/navigation';

// Tanstack React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types imports
import { UserToClientFromDB, UserDefaultSettings } from '@/types/userTypes';

// Context imports
import { useAppContext } from '@/app/context/AppContext';

export const useGetUser = () => {
	return useQuery<UserToClientFromDB>({
		queryKey: ['user-get'],
		queryFn: () => userAPI.getUser(),
	});
};

export const useGetUserSettings = () => {
	return useQuery<{ defaults: UserDefaultSettings }>({
		queryKey: ['user-settings-get'],
		queryFn: async () => {
			const data = await userAPI.getUser();

			if (!data) {
				redirect('/auth/login');
			}

			const cadenceTypeMapping: { [key: number]: string } = {
				1: '1day',
				3: '3day',
				31: '31day',
				7: 'weekly',
				14: 'biweekly',
				28: 'monthly',
			};

			const cadenceDurationMapping: { [key: number]: string | null } = {
				15: '15',
				30: '30',
				60: '60',
				90: '90',
				NaN: 'indefinite',
			};

			const autoSendDelayMapping: { [key: number]: string | null } = {
				1: '1',
				2: '2',
				999: 'never',
			};

			const defaults = {
				followUpCadence:
					cadenceTypeMapping[data?.defaultSequenceType || 0] || '3day',
				autoSend: data?.defaultRequireApproval || false,
				autoSendDelay:
					autoSendDelayMapping[data?.defaultSendDelay || NaN] || '',
				cadenceDuration:
					cadenceDurationMapping[data?.defaultSequenceDuration || NaN] || '30',
				referencePreviousEmail: data?.defaultReferencePrevious || false,
				alterSubjectLine: data?.defaultAlterSubjectLine || false,
			};

			return { defaults };
		},
	});
};

export const useUserAccountSettingsUpdate = () => {
	const queryClient = useQueryClient();

	return useMutation<UserToClientFromDB, Error, Partial<UserToClientFromDB>>({
		mutationFn: (updateData) => userAPI.updateAccountSettings(updateData),

		onSuccess: (updatedUser) => {
			// Update the user data in the cache with the updated user data
			queryClient.setQueryData<UserToClientFromDB>(['user-get'], updatedUser);

			queryClient.invalidateQueries({
				predicate: (query) =>
					['email-connection-status-get', 'user-settings-get'].includes(
						query.queryKey[0] as string,
					),
			});
		},

		onError: (error) => {
			console.error('Error updating user account settings:', error);
		},
	});
};

export const useDeleteUser = () => {
	const { setModalType } = useAppContext();
	const queryClient = useQueryClient();
	return useMutation<void, Error>({
		mutationFn: async () => {
			await userAPI.deleteUser();
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

export const useGetEmailConnectionStatus = () => {
	return useQuery<{ active: boolean }>({
		queryKey: ['email-connection-status-get'],
		queryFn: async () => {
			const data = await userAPI.getUser();

			if (!data) {
				redirect('/auth/login');
			}

			return { active: data?.emailConnectionActive || false };
		},
	});
};

export const useSetupGmailNotifications = () => {
	return useMutation({
		mutationFn: async () => {
			return await userAPI.setupWatchNotifications();
		},
		onSuccess: () => {
			console.log('Gmail notifications setup successfully');
		},
		onError: (error) => {
			console.error('Error setting up Gmail notifications:', error);
		},
	});
};

export const useStopGmailNotifications = () => {
	return useMutation({
		mutationFn: async () => {
			return await userAPI.stopWatchNotifications();
		},
		onSuccess: () => {},
		onError: (error) => {
			console.error('Error stopping Gmail notifications:', error);
		},
	});
};
