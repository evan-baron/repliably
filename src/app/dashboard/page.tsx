// Services imports
import { getAllContacts } from '@/services/contactsService';
import { getAllSequencesByUserId } from '@/services/sequenceService';
import {
	getAllPendingMessages,
	getAllRecentMessagesByUserId,
} from '@/services/messageService';
import { getAllRepliesByUserId } from '@/services/repliesService';

// Components imports
import DashboardClient from './DashboardClient';
import PageTemplate from '../components/pageSpecificComponents/PageTemplate';

const Dashboard = async () => {
	const [
		contacts,
		{ sequences },
		{ messages },
		{ replies },
		{ messages: activities },
	] = await Promise.all([
		getAllContacts(),
		getAllSequencesByUserId(),
		getAllPendingMessages(),
		getAllRepliesByUserId(),
		getAllRecentMessagesByUserId(),
	]);

	const invalidContacts = contacts.filter(
		(contact) => contact.validEmail === false || contact.firstName === null,
	);

	return (
		<PageTemplate
			title='Dashboard Overview'
			description='Welcome to your follow-up management center'
		>
			<DashboardClient
				initialInvalidEmailContacts={invalidContacts}
				initialSequences={sequences}
				initialPendingMessages={messages}
				initialReplies={replies}
				initialActivities={activities}
			/>
		</PageTemplate>
	);
};

export default Dashboard;
