'use client';

// Library imports
import { useState } from 'react';

// Styles imports
import styles from './settings.module.scss';

// Types imports
import { UserToClientFromDB } from '@/types/userTypes';

// Components imports
import NotificationsForm from '../../forms/notificationsSettings/NotificationsForm';

const NotificationSettings = ({ user }: { user: UserToClientFromDB }) => {
	return (
		<div className={styles['settings-container']}>
			<section className={styles.section}>
				<h3 className={styles['section-title']}>Email Notifications</h3>
				<p className={styles['section-description']}>
					Choose which events trigger email notifications to your account email.
				</p>
				<NotificationsForm user={user} />
			</section>
		</div>
	);
};

export default NotificationSettings;
