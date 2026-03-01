'use client';

import { ScheduleSendRounded, DraftsOutlined } from '@mui/icons-material';
import { MessageWithContact } from '@/types/messageTypes';
import { useAppContext } from '@/app/context/AppContext';
import WidgetCard from '../widgetCard/WidgetCard';
import styles from './pendingWidget.module.scss';
import widgetStyles from '../widgetCard/widgetCard.module.scss';

const MAX_ITEMS = 5;

interface PendingWidgetProps {
	messages: MessageWithContact[];
}

const PendingWidget = ({ messages }: PendingWidgetProps) => {
	const { setSelectedEmail, setModalType, setModalTitle } = useAppContext();

	const pendingCount = messages.filter(
		(m) =>
			m.status === 'pending' ||
			(m.status === 'scheduled' && m.needsApproval && !m.approved),
	).length;
	const scheduledCount = messages.length - pendingCount;

	const visibleMessages = messages.slice(0, MAX_ITEMS);

	const getMessageStatus = (message: MessageWithContact) => {
		if (
			message.status === 'pending' ||
			(message.status === 'scheduled' &&
				message.needsApproval &&
				!message.approved)
		) {
			return 'pending';
		}
		return 'scheduled';
	};

	const handleClick = (message: MessageWithContact) => {
		const contactName =
			message.contact?.firstName ?
				`${message.contact.firstName} ${message.contact.lastName || ''}`.trim()
			:	'Unknown';
		setSelectedEmail(message);
		setModalType('editMessage');
		setModalTitle(`Edit Email to ${contactName}`);
	};

	const statLabel =
		messages.length > 0 ?
			`${pendingCount} pending / ${scheduledCount} scheduled`
		:	'Pending & scheduled emails';

	return (
		<WidgetCard
			statNumber={messages.length}
			statLabel={statLabel}
			headerIcon={<ScheduleSendRounded />}
			headerGradient='linear-gradient(135deg, hsl(140, 84%, 76%) 0%, hsl(90, 88%, 83%) 50%, hsl(55, 70%, 83%) 100%)'
			footerLabel='View all pending'
			footerHref='/dashboard/pending'
			headerLabel='Pending & Scheduled Emails'
		>
			{visibleMessages.length > 0 ?
				<div className={styles.compactList}>
					{visibleMessages.map((message) => {
						const status = getMessageStatus(message);
						const contactName =
							message.contact?.firstName ?
								`${message.contact.firstName} ${message.contact.lastName || ''}`.trim()
							:	'Unknown';
						const scheduledDate =
							message.scheduledAt ?
								new Date(message.scheduledAt).toLocaleDateString()
							:	'Not scheduled';

						return (
							<div
								key={message.id}
								className={styles.listItem}
								onClick={() => handleClick(message)}
								role='button'
								tabIndex={0}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										handleClick(message);
									}
								}}
							>
								<div className={styles.itemHeader}>
									<span className={styles.contactName}>{contactName}</span>
									<span
										className={`${styles.statusBadge} ${status === 'pending' ? styles.pending : styles.scheduled}`}
									>
										{status === 'pending' ? 'Pending' : 'Scheduled'}
									</span>
								</div>
								<span className={styles.itemSubject}>{message.subject}</span>
								<span className={styles.itemDate}>{scheduledDate}</span>
							</div>
						);
					})}
				</div>
			:	<div className={widgetStyles.emptyState}>
					<DraftsOutlined className={widgetStyles.emptyIcon} />
					<span className={widgetStyles.emptyText}>
						No pending or scheduled emails
					</span>
				</div>
			}
		</WidgetCard>
	);
};

export default PendingWidget;
