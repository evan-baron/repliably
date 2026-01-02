// Library imports
import { redirect } from 'next/navigation';

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
		redirect('/dashboard/contacts');
	}

	return (
		<div className={styles['page-wrapper']}>
			<ContactDetailsClient initialContact={contact} />
		</div>
	);
};

export default Page;
