// API imports
import { messageAPI } from '@/services/api';

// Types imports
import { StandaloneMessagesResponse } from '@/types/messageTypes';

// Tanstack React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useStandaloneMessagesByContactId = (contactId: number) => {
	return useQuery<StandaloneMessagesResponse>({
		queryKey: ['standalone-messages-by-contact-id', contactId],
		queryFn: () => messageAPI.readStandaloneByContactId(contactId),
	});
};
