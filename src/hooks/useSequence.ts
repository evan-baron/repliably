// API imports
import { sequenceAPI } from '@/services/api';

// Types imports
import { SequencesResponse } from '@/types/sequenceTypes';

// Tanstack React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useSequencesByUserId = (userId: number) => {
	return useQuery<SequencesResponse>({
		queryKey: ['sequences-by-user-id', userId],
		queryFn: () => sequenceAPI.readAll(),
	});
};

export const useSequencesByContactId = (contactId: number) => {
	return useQuery<SequencesResponse>({
		queryKey: ['sequences-by-contact-id', contactId],
		queryFn: () => sequenceAPI.readAllByContactId(contactId),
	});
};

export const useSequenceDeactivate = (sequenceId: number) => {
	const queryClient = useQueryClient();

	return useMutation<void, Error, number>({
		mutationFn: () => sequenceAPI.deactivate(sequenceId),
		onSuccess: () => {
			// Invalidate relevant queries to refetch updated data
			queryClient.invalidateQueries({ queryKey: ['sequences-by-contact-id'] });
			queryClient.invalidateQueries({ queryKey: ['sequences-by-user-id'] });
			queryClient.invalidateQueries({ queryKey: ['contact-get-unique'] });
			queryClient.invalidateQueries({ queryKey: ['contacts-get-all'] });
			queryClient.invalidateQueries({
				queryKey: ['all-messages-by-contact-id'],
			});
		},
	});
};
