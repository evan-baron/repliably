'use client';

// Library imports
import { useState, useEffect, useMemo } from 'react';
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

// Icon imports
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';

// Types imports
import { ContactFromDB } from '@/types/contactTypes';
import { SanitizedSequence } from '@/types/sequenceTypes';
import { MessageFromDB, MessageWithContact } from '@/types/messageTypes';
import { RepliesFromDB } from '@/types/repliesTypes';

// Components Imports
import StatsRow from '../components/pageSpecificComponents/dashboard/statsRow/StatsRow';
import NeedsAttention from '../components/pageSpecificComponents/dashboard/NeedsAttention';
import ExpiringWidget from '../components/pageSpecificComponents/dashboard/expiringWidget/ExpiringWidget';
import PendingWidget from '../components/pageSpecificComponents/dashboard/pendingWidget/PendingWidget';
import AllActivities from '../components/sequences/AllActivities';
import Paginator from '../components/paginator/Paginator';

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

	// Stats computations
	const stats = useMemo(() => {
		const allSentMessages = activities.filter((m) => m.status === 'sent');

		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const emailsSentThisMonth = allSentMessages.filter(
			(m) => m.sentAt && new Date(m.sentAt) >= startOfMonth,
		).length;

		const repliedCount = allSentMessages.filter((m) => m.hasReply).length;
		const replyRate =
			allSentMessages.length > 0 ?
				Math.round((repliedCount / allSentMessages.length) * 100)
			:	0;

		const pendingApproval = pendingMessages.filter(
			(m) =>
				m.status === 'pending' ||
				(m.status === 'scheduled' && m.needsApproval && !m.approved),
		).length;

		const activeSequences = sequences.filter((s) => s.active).length;

		return {
			totalContacts: contacts.length,
			activeSequences,
			emailsSentThisMonth,
			replyRate,
			pendingApproval,
		};
	}, [contacts, sequences, pendingMessages, activities]);

	// filter only messages with status of sent from activities, limit to 200 most recent then organize it as an array of arrays with lengths of 15 for pagination
	const sentMessages = activities
		.filter((message) => message.status === 'sent')
		.slice(0, 200)
		.reduce((result: MessageWithContact[][], message, index) => {
			const chunkIndex = Math.floor(index / 15);
			if (!result[chunkIndex]) {
				result[chunkIndex] = [];
			}
			result[chunkIndex].push(message);
			return result;
		}, []);

	return (
		<div className={styles.dashboardHome}>
			<StatsRow
				totalContacts={stats.totalContacts}
				activeSequences={stats.activeSequences}
				emailsSentThisMonth={stats.emailsSentThisMonth}
				replyRate={stats.replyRate}
				pendingApproval={stats.pendingApproval}
			/>

			{needsAttention && <NeedsAttention invalidContacts={invalidContacts} />}

			<div className={styles.previewTiles}>
				<ExpiringWidget sequences={sequences} />
				<PendingWidget messages={pendingMessages as MessageWithContact[]} />
			</div>

			<section
				className={styles.recentActivity}
				aria-labelledby='recent-activity-title'
			>
				<h2 className={styles.sectionTitle} id='recent-activity-title'>
					Recent Activity
				</h2>
				{sentMessages.length > 0 ?
					<>
						<AllActivities
							multiPage={sentMessages.length > 1}
							parentDiv={'DashboardClient'}
							messages={sentMessages[activitiesPage]}
						/>
						{sentMessages.length > 1 && (
							<Paginator
								currentPage={activitiesPage}
								setCurrentPage={setActivitiesPage}
								pages={sentMessages}
							/>
						)}
					</>
				:	<div className={styles.activity}>
						<p>Any recent email activity will appear here</p>{' '}
					</div>
				}
			</section>
		</div>
	);
};

export default DashboardClient;
