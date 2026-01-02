// Services imports
import { getContactById } from '@/services/contactsService';

// Styles imports
import styles from './contactPage.module.scss';

// MUI imports
import { Phone, MailOutline, LinkedIn } from '@mui/icons-material';

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
		</div>
	);
};

export default Page;
