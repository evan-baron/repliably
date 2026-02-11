'use client';

// Library imports
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Hooks imports
import { useMessagesGetAllPending } from '@/hooks/useMessages';
import { useGetEmailConnectionStatus } from '@/hooks/useUserSettings';

// Components imports
import SideBar from './SideBar';

// Types imports
import { MessageFromDB, MessagesResponse } from '@/types/messageTypes';

export default function SideBarClient({
	initialMessages = [],
	initialEmailConnectionActive = false,
}: {
	initialMessages: MessageFromDB[];
	initialEmailConnectionActive: boolean;
}) {
	const queryClient = useQueryClient();

	// hydrate server data into the cache
	useEffect(() => {
		if (initialMessages) {
			queryClient.setQueryData<MessagesResponse>(['pending-messages-get-all'], {
				messages: initialMessages,
			});
		}
	}, [initialMessages, queryClient]);

	const { data } = useMessagesGetAllPending();
	const { data: emailConnectionStatus } = useGetEmailConnectionStatus(
		initialEmailConnectionActive,
	);
	console.log(
		'Email connection status in SideBarClient:',
		emailConnectionStatus,
	);

	useEffect(() => {
		if (data?.messages) {
			queryClient.setQueryData<MessagesResponse>(
				['pending-messages-get-all'],
				data,
			);
		} else if (initialMessages?.length) {
			queryClient.setQueryData<MessagesResponse>(['pending-messages-get-all'], {
				messages: initialMessages,
			});
		}
	}, [data, initialMessages, queryClient]);

	const messages = data?.messages || [];
	const pendingMessages = messages.filter((message) => message.needsApproval);
	const hasNotifications = pendingMessages.length > 0;

	return (
		<SideBar
			notifications={hasNotifications}
			emailConnectionStatus={emailConnectionStatus?.active}
		/>
	);
}
