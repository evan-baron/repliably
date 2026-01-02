// Services imports
import { getContactById } from '@/services/contactsService';

// Styles imports
import styles from './contactPage.module.scss';

// MUI imports

// Component imports
import ContactDetailsClient from './ContactDetailsClient';

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
	const { id } = await params;

	const contact = await getContactById(Number(id));

	if (!contact) {
		return (
			<div className={styles['page-wrapper']}>
				<h1>Contact Not Found</h1>
			</div>
		);
	}

	console.log(contact);

	return (
		<div className={styles['page-wrapper']}>
			<ContactDetailsClient initialContact={contact} />
			<section className={styles['activities-section']}>
				<div className={styles.nav}>
					<h2>Activity</h2>
					<h2>Send an Email</h2>
				</div>
				<div className={styles.content}>
					<p>No recent activity</p>
				</div>
			</section>
		</div>
	);
};

export default Page;
