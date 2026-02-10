// Libraries imports
import { redirect } from 'next/navigation';

// Services imports
import { getServerUser, getSessionUser } from '@/services/getUserService';

// Components imports
import PageTemplate from '@/app/components/pageSpecificComponents/PageTemplate';
import SettingsClient from './SettingsClient';
import { SettingsContextProvider } from '@/app/context/SettingsContext';

const Page = async ({
	searchParams,
}: {
	searchParams: Promise<{ tab?: string; email?: string; error?: string }>;
}) => {
	const { user, error } = await getServerUser();

	if (error || !user) {
		redirect('/');
	}

	const { identities, error: sessionError } = await getSessionUser();
	if (sessionError || error || !user) {
		redirect('/');
	}

	const params = await searchParams;

	const validTabs: SettingsTab[] = [
		'account',
		'email',
		'sequences',
		'notifications',
	];

	// If tab is provided but invalid, redirect to default
	if (params.tab && !validTabs.includes(params.tab as SettingsTab)) {
		redirect('/dashboard/settings?tab=account');
	}

	type SettingsTab = 'account' | 'email' | 'sequences' | 'notifications';

	const initialTab = params.tab as SettingsTab | undefined; // This will be passed to the client to set the initial active tab

	return (
		<PageTemplate
			title='Settings'
			description='Manage your account and application settings'
		>
			<SettingsContextProvider>
				<SettingsClient
					initialUser={user}
					identities={identities}
					emailStatus={params.email}
					errorStatus={params.error}
					initialTab={initialTab}
				/>
			</SettingsContextProvider>
		</PageTemplate>
	);
};

export default Page;
