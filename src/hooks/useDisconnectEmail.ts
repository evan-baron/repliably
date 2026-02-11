import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useDisconnectEmail = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			const response = await fetch('/api/auth/google/disconnect', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to disconnect Email');
			}

			return response.json();
		},
		onSuccess: () => {
			// Invalidate and refetch user data
			queryClient.invalidateQueries({
				predicate: (query) =>
					['user-get', 'email-connection-status'].includes(
						query.queryKey[0] as string,
					),
			});
		},
	});
};
