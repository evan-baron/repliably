'use client';

// Library imports
import { useState } from 'react';

// Components imports
import AccountSettings from '@/app/components/pageSpecificComponents/settings/AccountSettings';
import EmailSettings from '@/app/components/pageSpecificComponents/settings/EmailSettings';
import SequenceDefaults from '@/app/components/pageSpecificComponents/settings/SequenceDefaults';
import NotificationSettings from '@/app/components/pageSpecificComponents/settings/NotificationSettings';
import DisplayPreferences from '@/app/components/pageSpecificComponents/settings/DisplayPreferences';

// Styles imports
import styles from './settings.module.scss';

type SettingsTab =
	| 'account'
	| 'email'
	| 'sequences'
	| 'notifications'
	| 'display';

const SettingsClient = () => {
	const [activeTab, setActiveTab] = useState<SettingsTab>('account');

	const tabs: { id: SettingsTab; label: string }[] = [
		{ id: 'account', label: 'Account' },
		{ id: 'email', label: 'Email & Templates' },
		{ id: 'sequences', label: 'Sequence Defaults' },
		{ id: 'notifications', label: 'Notifications' },
		{ id: 'display', label: 'Display' },
	];

	const renderTabContent = () => {
		switch (activeTab) {
			case 'account':
				return <AccountSettings />;
			case 'email':
				return <EmailSettings />;
			case 'sequences':
				return <SequenceDefaults />;
			case 'notifications':
				return <NotificationSettings />;
			case 'display':
				return <DisplayPreferences />;
			default:
				return <AccountSettings />;
		}
	};

	return (
		<div className={styles.settingsContainer}>
			<nav className={styles.tabNav}>
				{tabs.map((tab) => (
					<button
						key={tab.id}
						className={`${styles.tabButton} ${
							activeTab === tab.id ? styles.active : ''
						}`}
						onClick={() => setActiveTab(tab.id)}
					>
						{tab.label}
					</button>
				))}
			</nav>

			<div className={styles.tabContent}>{renderTabContent()}</div>
		</div>
	);
};

export default SettingsClient;
