'use client';

// Library imports
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Hooks imports
import { useMessagesGetAllPending } from '@/hooks/useMessages';
import { useGetEmailConnectionStatus } from '@/hooks/useUserSettings';
import { useReplyNotifications } from '@/hooks/usePusher';
import { useGetAllReplies } from '@/hooks/useReplies';

// Components imports
import SideBar from './SideBar';

// Context imports
import { useAppContext } from '@/app/context/AppContext';

// Types imports
import { MessageFromDB, MessagesResponse } from '@/types/messageTypes';

export default function SideBarClient({
	initialMessages = [],
	initialEmailConnectionActive = false,
	userId,
}: {
	initialMessages: MessageFromDB[];
	initialEmailConnectionActive: boolean;
	userId: number;
}) {
	const queryClient = useQueryClient();
	const { newReplyNotification, setNewReplyNotification } = useAppContext();
	useReplyNotifications(userId.toString());
	// hydrate server data into the cache
	useEffect(() => {
		if (initialMessages) {
			queryClient.setQueryData<MessagesResponse>(['pending-messages-get-all'], {
				messages: initialMessages,
			});
		}

		if (initialEmailConnectionActive) {
			queryClient.setQueryData(['email-connection-status-get'], {
				active: initialEmailConnectionActive,
			});
		}
	}, [initialMessages, initialEmailConnectionActive, queryClient]);

	const { data } = useMessagesGetAllPending();
	const { data: emailConnectionStatus } = useGetEmailConnectionStatus();
	const { data: unfilteredRepliesData } = useGetAllReplies();

	const repliesData =
		unfilteredRepliesData &&
		unfilteredRepliesData.replies.filter((reply) => !reply.isBounce);

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

		if (emailConnectionStatus) {
			queryClient.setQueryData(['email-connection-status-get'], {
				active: emailConnectionStatus.active,
			});
		} else {
			queryClient.setQueryData(['email-connection-status-get'], {
				active: initialEmailConnectionActive,
			});
		}
	}, [data, initialMessages, initialEmailConnectionActive, queryClient]);

	useEffect(() => {
		if (repliesData) {
			const hasUnprocessed = repliesData.some((reply) => !reply.processed);
			setNewReplyNotification(hasUnprocessed);
		}
	}, [repliesData, setNewReplyNotification]);

	const messages = data?.messages || [];
	const pendingMessages = messages.filter((message) => message.needsApproval);
	const hasNotifications = pendingMessages.length > 0;

	return (
		<SideBar
			notifications={hasNotifications}
			emailConnectionStatus={emailConnectionStatus?.active}
			newReply={newReplyNotification}
		/>
	);
}
