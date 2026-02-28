'use client';

// Library imports
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Hooks imports
import { useContactsGetAll } from '@/hooks/useContact';
import { useAllSequencesByUserId } from '@/hooks/useSequence';
import {
	useMessagesGetAllPending,
	useAllMessagesByUserId,
} from '@/hooks/useMessages';
import { useGetAllReplies } from '@/hooks/useReplies';

// Styles imports
import styles from './dashboard.module.scss';

// Types imports
import { ContactFromDB } from '@/types/contactTypes';
import { SanitizedSequence } from '@/types/sequenceTypes';
import { MessageFromDB, MessageWithContact } from '@/types/messageTypes';
import { RepliesFromDB } from '@/types/repliesTypes';

// Components Imports
import NeedsAttention from '../components/pageSpecificComponents/dashboard/NeedsAttention';
import PendingMessagesClient from './pending/PendingMessagesClient';
import AllActivities from '../components/sequences/AllActivities';

interface DashboardClientProps {
	initialInvalidEmailContacts: ContactFromDB[];
	initialSequences: SanitizedSequence[];
	initialPendingMessages: MessageFromDB[];
	initialReplies: RepliesFromDB[];
	initialActivities: MessageWithContact[];
}

const DashboardClient = ({
	initialInvalidEmailContacts,
	initialSequences,
	initialPendingMessages,
	initialReplies,
	initialActivities,
}: DashboardClientProps) => {
	const queryClient = useQueryClient();

	// Hydrate React Query cache with server-fetched data
	useEffect(() => {
		if (initialSequences && initialSequences.length > 0) {
			queryClient.setQueryData(['sequences-by-user-id'], {
				sequences: initialSequences,
			});
		}
		if (initialPendingMessages && initialPendingMessages.length > 0) {
			queryClient.setQueryData(['pending-messages-get-all'], {
				messages: initialPendingMessages,
			});
		}
		if (initialReplies && initialReplies.length > 0) {
			queryClient.setQueryData(['replies-get-all'], {
				replies: initialReplies,
			});
		}
		if (initialActivities && initialActivities.length > 0) {
			queryClient.setQueryData(['activities-get-all'], {
				activities: initialActivities,
			});
		}
	}, [
		initialSequences,
		initialPendingMessages,
		initialReplies,
		initialActivities,
		queryClient,
	]);

	// Subscribe to live data
	const { data: contactsData } = useContactsGetAll();
	const { data: sequencesData } = useAllSequencesByUserId();
	const { data: pendingData } = useMessagesGetAllPending();
	const { data: activitiesData } = useAllMessagesByUserId();
	const { data: repliesData } = useGetAllReplies();

	const [activitiesPage, setActivitiesPage] = useState<number>(0);

	const contacts = contactsData?.contacts || [];
	const sequences = sequencesData?.sequences || [];
	const pendingMessages = pendingData?.messages || [];
	const activities = activitiesData?.messages || [];
	const replies = repliesData?.replies || [];

	// Derived data for dashboard sections
	// Use live contacts data if available, fall back to server-fetched initial data
	const invalidContacts =
		contacts.length > 0 ?
			contacts.filter(
				(contact) => contact.validEmail === false || contact.firstName === null,
			)
		:	initialInvalidEmailContacts;
	const bounces = replies.filter((reply) => reply.isBounce);
	const needsAttention = invalidContacts.length > 0 || bounces.length > 0;

	// filter only messages with status of sent from activities, limit to 200 most recent then organize it as an array of arrays with lengths of 20 for pagination
	const sentMessages = activities
		.filter((message) => message.status === 'sent')
		.slice(0, 200)
		.reduce((result: MessageWithContact[][], message, index) => {
			const chunkIndex = Math.floor(index / 20);
			if (!result[chunkIndex]) {
				result[chunkIndex] = [];
			}
			result[chunkIndex].push(message);
			return result;
		}, []);

	console.log('sentMessages in DashboardClient:', sentMessages);
	return (
		<div className={styles.dashboardHome}>
			{needsAttention && <NeedsAttention invalidContacts={invalidContacts} />}

			<div className={styles.previewTiles}>
				<section
					className={styles.previewTile}
					aria-labelledby='expiring-soon-title'
				>
					<h2 className={styles.sectionTitle} id='expiring-soon-title'>
						Expiring Soon
					</h2>
					<div className={styles.activity}>
						<p>
							Sequences expiring within 7 days will appear here. You currently
							have no sequences expiring in the next 7 days.
						</p>
					</div>
				</section>
				<section
					className={styles.previewTile}
					aria-labelledby='pending-emails-title'
				>
					<h2 className={styles.sectionTitle} id='pending-emails-title'>
						Pending & Scheduled Emails
					</h2>
					{pendingMessages.length > 0 ?
						<PendingMessagesClient
							parentDiv={'DashboardClient'}
							initialMessages={pendingMessages}
						/>
					:	<div className={styles.activity}>
							<p>Pending or scheduled emails will appear here</p>
						</div>
					}
				</section>
			</div>

			<section
				className={styles.recentActivity}
				aria-labelledby='recent-activity-title'
			>
				<h2 className={styles.sectionTitle} id='recent-activity-title'>
					Recent Activity
				</h2>
				{sentMessages.length > 0 ?
					<AllActivities
						parentDiv={'DashboardClient'}
						messages={sentMessages[activitiesPage]}
					/>
				:	<div className={styles.activity}>
						<p>Any recent email activity will appear here</p>{' '}
					</div>
				}
			</section>
		</div>
	);
};

export default DashboardClient;
