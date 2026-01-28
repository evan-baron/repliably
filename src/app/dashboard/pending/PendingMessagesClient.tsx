'use client';

// Libraries imports
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Hooks imports
import { useMessagesGetAllPending } from '@/hooks/useMessages';

// Types imports
import { MessageFromDB, MessagesResponse } from '@/types/messageTypes';

// Components imports
import PendingMessagesTable from '@/app/components/pageSpecificComponents/pending/PendingMessagesTable';

// Context imports
import { useAppContext } from '@/app/context/AppContext';

export default function PendingMessagesClient({
	initialMessages = [],
}: {
	initialMessages: MessageFromDB[];
}) {
	const queryClient = useQueryClient();

	const { setLoading, setLoadingMessage } = useAppContext();

	// hydrate server data into the cache
	useEffect(() => {
		if (initialMessages) {
			queryClient.setQueryData<MessagesResponse>(['pending-messages-get-all'], {
				messages: initialMessages,
			});
		}
	}, [initialMessages, queryClient]);

	const pendingQuery = useMessagesGetAllPending();
	const { data, isLoading, isFetching } = pendingQuery;
	const messages = data?.messages || [];

	useEffect(() => {
		const loading = isLoading || isFetching;
		setLoading(loading);
		setLoadingMessage(loading ? 'Loading' : null);
	}, [isLoading, isFetching, setLoading, setLoadingMessage]);

	return <PendingMessagesTable messages={messages} />;
}
