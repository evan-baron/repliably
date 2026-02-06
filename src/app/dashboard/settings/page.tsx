// Libraries imports
import { redirect } from 'next/navigation';

// Services imports
import { getServerUser, getSessionUser } from '@/services/getUserService';

// Components imports
import PageTemplate from '@/app/components/pageSpecificComponents/PageTemplate';
import SettingsClient from './SettingsClient';
import { SettingsContextProvider } from '@/app/context/SettingsContext';

const Page = async () => {
	const { user, error } = await getServerUser();

	if (error || !user) {
		redirect('/');
	}

	const { identities, error: sessionError } = await getSessionUser();
	if (sessionError || error || !user) {
		redirect('/');
	}

	return (
		<PageTemplate
			title='Settings'
			description='Manage your account and application settings'
		>
			<SettingsContextProvider>
				<SettingsClient initialUser={user} identities={identities} />
			</SettingsContextProvider>
		</PageTemplate>
	);
};

export default Page;
