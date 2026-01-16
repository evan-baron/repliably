// Library imports
import { useState, Fragment } from 'react';

// Styles imports
import styles from './tableStyles.module.scss';

// Icon imports
import { SwapVert } from '@mui/icons-material';

// Types imports
import { MessagesWithActiveSequence } from '@/types/messageTypes';

// Components
import MessagesTable from './MessagesTable';
import { g } from 'vitest/dist/chunks/suite.d.BJWk38HB';

const AllActivitiesTable = ({
	messages,
}: {
	messages: MessagesWithActiveSequence[];
}) => {
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const [selectedActivity, setSelectedActivity] = useState<number | null>(null);

	const handleSort = () => {
		setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
	};

	const sortedMessages = messages.sort((a, b) => {
		const dateA = new Date(a.createdAt);
		const dateB = new Date(b.createdAt);
		return sortOrder === 'asc'
			? dateA.getTime() - dateB.getTime()
			: dateB.getTime() - dateA.getTime();
	});

	const handleClick = (index: number) => {
		if (selectedActivity === index) {
			setSelectedActivity(null);
		} else {
			setSelectedActivity(index);
		}
	};

	const getSendDate = (message: MessagesWithActiveSequence): string => {
		if (message.status === 'sent' && message.sentAt) {
			return new Date(message.sentAt).toLocaleDateString();
		}
		if (
			(message.status === 'pending' ||
				message.status === 'scheduled' ||
				message.status === 'cancelled') &&
			message.scheduledAt
		) {
			return new Date(message.scheduledAt).toLocaleDateString();
		}
		return 'N/A';
	};

	return (
		<table className={styles.table}>
			<thead className={styles.tableHeader}>
				<tr>
					<th className={styles.sm}>
						<span className={styles.sort}>Type</span>
					</th>
					<th className={styles.sm}>Status</th>
					<th className={styles.lrg}>Name</th>
					<th className={styles.sm} onClick={() => handleSort()}>
						<span className={styles.sort}>
							Send Date
							<SwapVert fontSize='small' />
						</span>
					</th>
					<th className={styles.sm}>Replied</th>
				</tr>
			</thead>
			<tbody>
				{sortedMessages.map((message, index) => {
					const sendDate = getSendDate(message);

					return (
						<Fragment key={index}>
							<tr
								className={selectedActivity === index ? styles.selected : ''}
								onClick={() => {
									handleClick(index);
								}}
							>
								<td className={styles.sm}>
									{message.sequenceId ? 'Sequence Email' : 'Stand-alone Email'}
								</td>
								<td className={styles.sm}>
									{message.sequenceId ? (
										<span
											className={`${
												message.status === 'pending'
													? styles.pending
													: message.status === 'scheduled'
													? styles.scheduled
													: message.status === 'sent'
													? styles.sent
													: message.status === 'cancelled'
													? styles.cancelled
													: ''
											}`}
										>
											{message.status === 'pending'
												? 'Pending Approval'
												: message.status[0].toUpperCase() +
												  message.status.slice(1)}
										</span>
									) : (
										<span className={styles.na}>N/A</span>
									)}
								</td>
								<td
									className={`${styles.md} ${styles.left}`}
									style={{ fontWeight: '600' }}
								>
									{message.sequenceId ? message.subject : message.subject}
								</td>

								<td className={`${styles.sm} ${styles.right}`}>{sendDate}</td>
								<td className={`${styles.sm} ${styles.right}`}>
									{message.sequenceId
										? message.hasReply
											? 'Yes'
											: 'No'
										: message.hasReply
										? 'Yes'
										: 'No'}
								</td>
							</tr>
							{selectedActivity === index ? (
								<tr className={styles['expanded-row']}>
									<td colSpan={6}>
										<MessagesTable messages={[message]} nested={true} />
									</td>
								</tr>
							) : null}
						</Fragment>
					);
				})}
			</tbody>
		</table>
	);
};

export default AllActivitiesTable;
