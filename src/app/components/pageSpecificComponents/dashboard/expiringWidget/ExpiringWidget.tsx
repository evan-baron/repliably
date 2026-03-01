'use client';

import { useRouter } from 'next/navigation';
import { HourglassBottom, CheckCircleOutline } from '@mui/icons-material';
import { SanitizedSequence } from '@/types/sequenceTypes';
import WidgetCard from '../widgetCard/WidgetCard';
import styles from './expiringWidget.module.scss';
import widgetStyles from '../widgetCard/widgetCard.module.scss';

const MAX_ITEMS = 4;

interface ExpiringWidgetProps {
	sequences: SanitizedSequence[];
}

const ExpiringWidget = ({ sequences }: ExpiringWidgetProps) => {
	const router = useRouter();

	const now = new Date();
	const sevenDaysFromNow = new Date(now);
	sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

	const expiringSequences = sequences
		.filter((seq) => {
			if (!seq.active || !seq.endDate) return false;
			const endDate = new Date(seq.endDate);
			return endDate >= now && endDate <= sevenDaysFromNow;
		})
		.sort(
			(a, b) => new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime(),
		)
		.slice(0, MAX_ITEMS);

	const getDaysRemaining = (endDate: Date): number => {
		const diffMs = new Date(endDate).getTime() - now.getTime();
		return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
	};

	const getBadgeClass = (days: number): string => {
		if (days <= 1) return styles.critical;
		if (days <= 4) return styles.warning;
		return styles.safe;
	};

	return (
		<WidgetCard
			statNumber={expiringSequences.length}
			statLabel='Expiring within 7 days'
			headerIcon={<HourglassBottom />}
			footerLabel='View all sequences'
			footerHref='/dashboard/sequences'
			headerLabel='Sequences Expiring Soon'
		>
			{expiringSequences.length > 0 ?
				<div className={styles.compactList}>
					{expiringSequences.map((seq) => {
						const days = getDaysRemaining(seq.endDate!);
						const contactName =
							seq.contact?.firstName ?
								`${seq.contact.firstName}${seq.contact.lastName ? ` ${seq.contact.lastName}` : ''}`
							:	'Unknown Contact';

						return (
							<div
								key={seq.id}
								className={styles.listItem}
								onClick={() =>
									router.push(`/dashboard/contacts/${seq.contact?.id}`)
								}
								role='link'
								tabIndex={0}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										router.push(`/dashboard/contacts/${seq.contact?.id}`);
									}
								}}
							>
								<div className={styles.itemInfo}>
									<span className={styles.itemName}>{contactName}</span>
									<span className={styles.itemTitle}>{seq.title}</span>
								</div>
								<span className={`${styles.daysBadge} ${getBadgeClass(days)}`}>
									{days === 1 ? '1 day' : `${days} days`}
								</span>
							</div>
						);
					})}
				</div>
			:	<div className={widgetStyles.emptyState}>
					<CheckCircleOutline className={widgetStyles.emptyIcon} />
					<span className={widgetStyles.emptyText}>
						All clear — no sequences expiring soon
					</span>
				</div>
			}
		</WidgetCard>
	);
};

export default ExpiringWidget;
