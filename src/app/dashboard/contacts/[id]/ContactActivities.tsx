'use client';

// Library imports
import { useState } from 'react';

// Hooks imports

// Styles imports
import styles from './contactPage.module.scss';

// Icon imports

// Components imports
import NewEmailForm from '@/app/components/forms/newEmail/NewEmailForm';

// Context imports

// Types imports
import { ContactFromDB } from '@/types/contactTypes';

const ContactActivities = ({ contact }: { contact: ContactFromDB }) => {
	type SelectedType = 'activity' | 'email';
	const [selected, setSelected] = useState<SelectedType>('activity');

	return (
		<section className={styles['activities-wrapper']}>
			<div className={styles.nav}>
				<h2
					className={selected === 'activity' ? styles.selected : ''}
					onClick={() => setSelected('activity')}
				>
					Recent Activity
				</h2>
				<h2
					className={selected === 'email' ? styles.selected : ''}
					onClick={() => setSelected('email')}
				>
					Send an Email
				</h2>
			</div>
			<div className={styles.content}>
				{selected === 'activity' ? (
					<div className={styles.activity}>
						<p>No recent activity</p>
					</div>
				) : (
					<NewEmailForm contactEmail={contact.email} active={contact.active} />
				)}
			</div>
		</section>
	);
};

export default ContactActivities;
