// API imports
import { messageAPI } from '@/services/api';

// Types imports
import {
	MessagesResponse,
	MessagesWithContactResponse,
} from '@/types/messageTypes';

// Tanstack React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useAllMessagesByUserId = () => {
	return useQuery<MessagesWithContactResponse>({
		queryKey: ['all-messages-by-user-id'],
		queryFn: () => messageAPI.readAllByUserId(),
		refetchOnWindowFocus: true,
	});
};

export const useAllMessagesByContactId = (contactId: number) => {
	return useQuery<MessagesResponse>({
		queryKey: ['all-messages-by-contact-id', contactId],
		queryFn: () => messageAPI.readAllByContactId(contactId),
		refetchOnWindowFocus: true,
	});
};

export const useMessagesGetAllPending = () => {
	return useQuery<MessagesWithContactResponse>({
		queryKey: ['pending-messages-get-all'],
		queryFn: () => messageAPI.getAllPending(),
		refetchOnWindowFocus: true,
	});
};

export const useMessageApprove = () => {
	const queryClient = useQueryClient();

	return useMutation<void, Error, number>({
		mutationFn: (messageId: number) => messageAPI.approveMessage(messageId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				predicate: (query) =>
					[
						'pending-messages-get-all',
						'all-messages-by-contact-id',
						'messages-get-by-contact',
						'sequences-get-by-contact',
					].includes(query.queryKey[0] as string),
			});
		},
	});
};

export const useMessageUpdate = () => {
	const queryClient = useQueryClient();

	return useMutation<
		void,
		Error,
		{ messageId: number; contents: string; subject: string }
	>({
		mutationFn: ({ messageId, contents, subject }) =>
			messageAPI.updateMessage(messageId, contents, subject),
		onSuccess: () => {
			queryClient.invalidateQueries({
				predicate: (query) =>
					['pending-messages-get-all', 'all-messages-by-contact-id'].includes(
						query.queryKey[0] as string,
					),
			});
		},
	});
};
