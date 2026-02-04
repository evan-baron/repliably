'use client';

// Library imports
import { useState } from 'react';

// Styles imports
import styles from './NotificationSettings.module.scss';

const NotificationSettings = () => {
	const [notifications, setNotifications] = useState({
		emailReplies: true,
		bounceAlerts: true,
		sequenceComplete: false,
		messageApproval: true,
		dailyDigest: true,
		weeklyReport: false,
		errorAlerts: true,
		cronJobFailures: true,
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, checked } = e.target;
		setNotifications((prev) => ({ ...prev, [name]: checked }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// TODO: Implement save functionality
		console.log('Saving notification settings:', notifications);
	};

	return (
		<div className={styles.notificationSettings}>
			<section className={styles.section}>
				<h2 className={styles.sectionTitle}>Email Notifications</h2>
				<p className={styles.sectionDescription}>
					Choose which events trigger email notifications to your account email
				</p>

				<form onSubmit={handleSubmit} className={styles.form}>
					<div className={styles.notificationGroup}>
						<h3 className={styles.groupTitle}>Contact Activity</h3>

						<div className={styles.notificationItem}>
							<div className={styles.itemInfo}>
								<label htmlFor='emailReplies'>
									<strong>Email Replies</strong>
								</label>
								<p>Get notified when a contact replies to your email</p>
							</div>
							<input
								type='checkbox'
								id='emailReplies'
								name='emailReplies'
								checked={notifications.emailReplies}
								onChange={handleChange}
								className={styles.toggle}
							/>
						</div>

						<div className={styles.notificationItem}>
							<div className={styles.itemInfo}>
								<label htmlFor='bounceAlerts'>
									<strong>Bounce Alerts</strong>
								</label>
								<p>Get notified when an email bounces</p>
							</div>
							<input
								type='checkbox'
								id='bounceAlerts'
								name='bounceAlerts'
								checked={notifications.bounceAlerts}
								onChange={handleChange}
								className={styles.toggle}
							/>
						</div>
					</div>

					<div className={styles.notificationGroup}>
						<h3 className={styles.groupTitle}>Sequence Activity</h3>

						<div className={styles.notificationItem}>
							<div className={styles.itemInfo}>
								<label htmlFor='sequenceComplete'>
									<strong>Sequence Completion</strong>
								</label>
								<p>Get notified when a sequence completes or is deactivated</p>
							</div>
							<input
								type='checkbox'
								id='sequenceComplete'
								name='sequenceComplete'
								checked={notifications.sequenceComplete}
								onChange={handleChange}
								className={styles.toggle}
							/>
						</div>

						<div className={styles.notificationItem}>
							<div className={styles.itemInfo}>
								<label htmlFor='messageApproval'>
									<strong>Message Approval Required</strong>
								</label>
								<p>Get notified when a generated message needs your approval</p>
							</div>
							<input
								type='checkbox'
								id='messageApproval'
								name='messageApproval'
								checked={notifications.messageApproval}
								onChange={handleChange}
								className={styles.toggle}
							/>
						</div>
					</div>

					<div className={styles.notificationGroup}>
						<h3 className={styles.groupTitle}>Summaries & Reports</h3>

						<div className={styles.notificationItem}>
							<div className={styles.itemInfo}>
								<label htmlFor='dailyDigest'>
									<strong>Daily Digest</strong>
								</label>
								<p>Daily summary of activity, replies, and pending actions</p>
							</div>
							<input
								type='checkbox'
								id='dailyDigest'
								name='dailyDigest'
								checked={notifications.dailyDigest}
								onChange={handleChange}
								className={styles.toggle}
							/>
						</div>

						<div className={styles.notificationItem}>
							<div className={styles.itemInfo}>
								<label htmlFor='weeklyReport'>
									<strong>Weekly Report</strong>
								</label>
								<p>Weekly analytics and performance summary</p>
							</div>
							<input
								type='checkbox'
								id='weeklyReport'
								name='weeklyReport'
								checked={notifications.weeklyReport}
								onChange={handleChange}
								className={styles.toggle}
							/>
						</div>
					</div>

					<div className={styles.notificationGroup}>
						<h3 className={styles.groupTitle}>System Alerts</h3>

						<div className={styles.notificationItem}>
							<div className={styles.itemInfo}>
								<label htmlFor='errorAlerts'>
									<strong>Error Alerts</strong>
								</label>
								<p>Get notified of critical errors affecting your account</p>
							</div>
							<input
								type='checkbox'
								id='errorAlerts'
								name='errorAlerts'
								checked={notifications.errorAlerts}
								onChange={handleChange}
								className={styles.toggle}
							/>
						</div>

						<div className={styles.notificationItem}>
							<div className={styles.itemInfo}>
								<label htmlFor='cronJobFailures'>
									<strong>Background Job Failures</strong>
								</label>
								<p>Get notified when scheduled background jobs fail</p>
							</div>
							<input
								type='checkbox'
								id='cronJobFailures'
								name='cronJobFailures'
								checked={notifications.cronJobFailures}
								onChange={handleChange}
								className={styles.toggle}
							/>
						</div>
					</div>

					<div className={styles.formActions}>
						<button type='submit' className={styles.primaryButton}>
							Save Preferences
						</button>
					</div>
				</form>
			</section>

			<section className={styles.section}>
				<h2 className={styles.sectionTitle}>Notification Channels</h2>
				<p className={styles.sectionDescription}>
					Configure additional notification channels
				</p>

				<div className={styles.channelList}>
					<div className={styles.channelItem}>
						<div>
							<h3>Slack Integration</h3>
							<p>Receive notifications in Slack</p>
							<span className={styles.status}>Not connected</span>
						</div>
						<button className={styles.secondaryButton}>Connect Slack</button>
					</div>

					<div className={styles.channelItem}>
						<div>
							<h3>Webhook</h3>
							<p>Send notifications to a custom webhook URL</p>
							<span className={styles.status}>Not configured</span>
						</div>
						<button className={styles.secondaryButton}>
							Configure Webhook
						</button>
					</div>
				</div>
			</section>
		</div>
	);
};

export default NotificationSettings;
