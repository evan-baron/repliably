// Components imports
import PageTemplate from '@/app/components/pageSpecificComponents/PageTemplate';
import SettingsClient from './SettingsClient';

const Page = () => {
	return (
		<PageTemplate
			title='Settings'
			description='Manage your account and application settings'
		>
			<SettingsClient />
		</PageTemplate>
	);
};

export default Page;
