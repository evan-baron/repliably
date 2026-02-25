// Library imports

// Styles imports
import styles from './dashboard.module.scss';

// Components imports
import PreviewTile from '../components/pageSpecificComponents/dashboard/previewTile/PreviewTile';

const Dashboard = () => {
	return (
		<div className={styles.dashboardHome} aria-labelledby='dashboard-title'>
			<section
				className={styles.welcomeSection}
				aria-labelledby='dashboard-title'
			>
				<h1 className={styles.welcomeTitle} id='dashboard-title'>
					Dashboard Overview
				</h1>
				<p
					className={styles.welcomeSubtitle}
					aria-describedby='dashboard-title'
				>
					Welcome to your follow-up management center
				</p>
			</section>

			<section
				className={styles.previewTiles}
				aria-labelledby='preview-tiles-title'
			>
				<PreviewTile title='Expiring Soon' href='/dashboard/sequences'>
					<div></div>
				</PreviewTile>
				<PreviewTile
					title='Pending & Scheduled Emails'
					href='/dashboard/pending'
				>
					<div></div>
				</PreviewTile>
			</section>

			<section
				className={styles.recentActivity}
				aria-labelledby='recent-activity-title'
			>
				<h2 className={styles.sectionTitle} id='recent-activity-title'>
					Recent Activity
				</h2>
			</section>
		</div>
	);
};

export default Dashboard;
