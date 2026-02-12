// Libraries imports
import { redirect } from 'next/navigation';

// Services imports
import { getServerUser } from '@/services/getUserService';
import { getUserSettings } from '@/services/settingsService';

// Hooks imports

// Styles imports
import styles from './newEmail.module.scss';

// Components imports
import NewEmailForm from '../../components/forms/newEmail/NewEmailForm';
import PageTemplate from '@/app/components/pageSpecificComponents/PageTemplate';

const Page = async () => {
	const { user, error } = await getServerUser();

	if (!user || error || !user.emailConnectionActive) {
		redirect('/');
	}

	const { signatures } = user;

	const { defaults } = await getUserSettings();

	const defaultSettings = {
		followUpCadence: '3day',
		autoSend: false,
		autoSendDelay: '',
		cadenceDuration: '60',
		referencePreviousEmail: false,
		alterSubjectLine: false,
	};

	return (
		<PageTemplate
			title='New Email'
			description='Write a new email or use a template to get started.'
		>
			<NewEmailForm
				signatures={signatures}
				defaults={defaults || defaultSettings}
			/>
		</PageTemplate>
	);
};

export default Page;
