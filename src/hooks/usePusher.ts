import { useEffect } from 'react';
import Pusher from 'pusher-js';
import { useQueryClient } from '@tanstack/react-query';

// Context
import { useAppContext } from '@/app/context/AppContext';

export function useReplyNotifications(userId: string) {
	const queryClient = useQueryClient();
	const { newReplyNotification, setNewReplyNotification } = useAppContext();

	useEffect(() => {
		const pusher = new Pusher(process.env.PUSHER_KEY!, {
			cluster: process.env.PUSHER_CLUSTER!,
		});

		console.log('Subscribing to Pusher channel for user:', userId);

		const channel = pusher.subscribe(`user-${userId}`);

		channel.bind('reply-received', (data: any) => {
			// Invalidate replies query for the contact
			queryClient.invalidateQueries({
				predicate: (query) =>
					['replies-get-all', 'all-messages-by-contact-id'].includes(
						query.queryKey[0] as string,
					),
			});
			!newReplyNotification && setNewReplyNotification(true);
		});

		return () => {
			channel.unbind_all();
			channel.unsubscribe();
			pusher.disconnect();
		};
	}, [userId, queryClient, newReplyNotification, setNewReplyNotification]);
}
