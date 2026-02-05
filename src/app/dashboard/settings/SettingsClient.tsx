'use client';

// Library imports
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Hooks imports
import { useUser } from '@/hooks/useUser';

// Context imports
import { useAppContext } from '@/app/context/AppContext';
import { useSettingsContext } from '@/app/context/SettingsContext';

// Components imports
import AccountSettings from '@/app/components/pageSpecificComponents/settings/AccountSettings';
import EmailSettings from '@/app/components/pageSpecificComponents/settings/EmailSettings';
import SequenceDefaults from '@/app/components/pageSpecificComponents/settings/SequenceDefaults';
import NotificationSettings from '@/app/components/pageSpecificComponents/settings/NotificationSettings';

// Styles imports
import styles from './settingsClient.module.scss';

// Types imports
import { UserToClientFromDB } from '@/types/userTypes';

type SettingsTab =
	| 'account'
	| 'email'
	| 'sequences'
	| 'notifications'
	| 'billing';

const SettingsClient = ({
	initialUser,
}: {
	initialUser: UserToClientFromDB;
}) => {
	const queryClient = useQueryClient();
	const userQuery = useUser();

	const { setLoading, setLoadingMessage, setModalType, setErrors } =
		useAppContext();
	const { activeTab, setActiveTab, hasUnsavedChanges } = useSettingsContext();

	useEffect(() => {
		if (initialUser) {
			queryClient.setQueryData<UserToClientFromDB>(['user-get'], initialUser);
		}
	}, [initialUser, queryClient]);

	const { data: userData } = userQuery;

	const tabs: { id: SettingsTab; label: string }[] = [
		{ id: 'account', label: 'Account' },
		{ id: 'email', label: 'Email & Templates' },
		{ id: 'sequences', label: 'Sequences' },
		{ id: 'notifications', label: 'Notifications' },
		// { id: 'billing', label: 'Billing' },
	];

	const renderTabContent = () => {
		if (!userData) {
			setLoading(true);
			setLoadingMessage('Loading');
			return null;
		}

		switch (activeTab) {
			case 'account':
				return <AccountSettings user={userData} />;
			case 'email':
				return <EmailSettings user={userData} />;
			case 'sequences':
				return <SequenceDefaults user={userData} />;
			case 'notifications':
				return <NotificationSettings user={userData} />;
			default:
				return <AccountSettings user={userData} />;
		}
	};

	const handleClick = (tabId: SettingsTab) => {
		if (hasUnsavedChanges) {
			setModalType('error');
			setErrors([
				'You have unsaved changes. Are you sure you want to switch tabs and lose those changes?',
			]);
		}
		setActiveTab(tabId);
	};

	return (
		<div className={styles.settingsContainer}>
			<nav className={styles.nav}>
				{tabs.map((tab, index) => (
					<>
						<h2
							key={index}
							className={`${styles.tabButton} ${
								activeTab === tab.id ? styles.selected : ''
							}`}
							onClick={() => handleClick(tab.id)}
						>
							{tab.label}
						</h2>
						{index < tabs.length - 1 && <div className={styles.divider}></div>}
					</>
				))}
			</nav>

			<div className={styles.tabContent}>{renderTabContent()}</div>
		</div>
	);
};

export default SettingsClient;
