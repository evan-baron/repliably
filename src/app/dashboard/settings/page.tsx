// Libraries imports
import { redirect } from 'next/navigation';

// Services imports
import { getServerUser } from '@/services/getUserService';

// Components imports
import PageTemplate from '@/app/components/pageSpecificComponents/PageTemplate';
import SettingsClient from './SettingsClient';

const Page = async () => {
	const { user, error } = await getServerUser();

	if (error || !user) {
		redirect('/');
	}

	return (
		<PageTemplate
			title='Settings'
			description='Manage your account and application settings'
		>
			<SettingsClient initialUser={user} />
		</PageTemplate>
	);
};

export default Page;
