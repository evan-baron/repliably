// Library imports

// Services imports
import { getAllContacts } from '@/services/contactsService';

// Styles imports
import styles from './dashboard.module.scss';

// Components imports
import PageTemplate from '../components/pageSpecificComponents/PageTemplate';

const Dashboard = async () => {
	const contacts = await getAllContacts();

	// filter contacts with !validEmail into a separate array for dashboard display
	const invalidEmailContacts =
		contacts && contacts.length > 0 ?
			contacts.filter((contact) => contact.validEmail === false)
		:	[];

	return (
		<PageTemplate
			title='Dashboard Overview'
			description='Welcome to your follow-up management center'
		>
			<div className={styles.dashboardHome}>
				{/* Conditionally rendered when items need attention */}
				<section
					className={styles.needsAttention}
					aria-labelledby='needs-attention-title'
				>
					<h2 className={styles.sectionTitle} id='needs-attention-title'>
						Items Needing Attention
					</h2>
				</section>

				<div className={styles.previewTiles}>
					<section
						className={styles.previewTile}
						aria-labelledby='expiring-soon-title'
					>
						<h2 className={styles.sectionTitle} id='expiring-soon-title'>
							Expiring Soon
						</h2>
					</section>
					<section
						className={styles.previewTile}
						aria-labelledby='pending-emails-title'
					>
						<h2 className={styles.sectionTitle} id='pending-emails-title'>
							Pending & Scheduled Emails
						</h2>
					</section>
				</div>

				<section
					className={styles.recentActivity}
					aria-labelledby='recent-activity-title'
				>
					<h2 className={styles.sectionTitle} id='recent-activity-title'>
						Recent Activity
					</h2>
				</section>
			</div>
		</PageTemplate>
	);
};

export default Dashboard;
