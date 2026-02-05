import { Suspense } from 'react';
import GmailConnection from '@/app/components/pageSpecificComponents/settings/gmail/GmailConnection';

export default function SettingsPage() {
	return (
		<div style={{ padding: '24px', maxWidth: '800px' }}>
			<h1 style={{ marginBottom: '24px' }}>Settings</h1>

			<Suspense fallback={<div>Loading Gmail settings...</div>}>
				<GmailConnection />
			</Suspense>
		</div>
	);
}
