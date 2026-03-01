'use client';

// Styles imports
import styles from './statsRow.module.scss';

// Icon imports
import {
	GroupsRounded,
	ViewTimelineRounded,
	SendRounded,
	ReplyRounded,
	ScheduleSendRounded,
} from '@mui/icons-material';

interface StatsRowProps {
	totalContacts: number;
	activeSequences: number;
	emailsSentThisMonth: number;
	replyRate: number;
	pendingApproval: number;
}

const StatsRow = ({
	totalContacts,
	activeSequences,
	emailsSentThisMonth,
	replyRate,
	pendingApproval,
}: StatsRowProps) => {
	const stats = [
		{
			label: 'Total Contacts',
			value: totalContacts,
			icon: <GroupsRounded className={styles.statIcon} />,
		},
		{
			label: 'Active Sequences',
			value: activeSequences,
			icon: <ViewTimelineRounded className={styles.statIcon} />,
		},
		{
			label: 'Sent This Month',
			value: emailsSentThisMonth,
			icon: <SendRounded className={styles.statIcon} />,
		},
		{
			label: 'Reply Rate',
			value: `${replyRate}%`,
			icon: <ReplyRounded className={styles.statIcon} />,
		},
		{
			label: 'Pending Approval',
			value: pendingApproval,
			icon: <ScheduleSendRounded className={styles.statIcon} />,
			urgent: pendingApproval > 0,
		},
	];

	return (
		<div className={styles.statsRow}>
			{stats.map((stat) => (
				<div
					key={stat.label}
					className={`${styles.statCard} ${stat.urgent ? styles.urgent : ''}`}
				>
					{stat.icon}
					<div className={styles.statContent}>
						<span className={styles.statNumber}>{stat.value}</span>
						<span className={styles.statLabel}>{stat.label}</span>
					</div>
				</div>
			))}
		</div>
	);
};

export default StatsRow;
