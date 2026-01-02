// Services imports
import { getContactById } from '@/services/contactsService';

// Styles imports
import styles from './contactPage.module.scss';

// MUI imports

// Component imports
import ContactDetailsClient from './ContactDetailsClient';
import ContactActivities from './ContactActivities';

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
			<ContactActivities contact={contact} />
		</div>
	);
};

export default Page;
