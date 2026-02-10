'use client';

// Library imports
import { useEffect, Fragment } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter, usePathname } from 'next/navigation';

// Hooks imports
import { useGetUser } from '@/hooks/useUserSettings';

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
import { Auth0Identity } from '@/lib/helpers/checkAuthMethod';

type SettingsTab = 'account' | 'email' | 'sequences' | 'notifications';

const SettingsClient = ({
	initialUser,
	identities,
	emailStatus,
	errorStatus,
	initialTab,
}: {
	initialUser: UserToClientFromDB;
	identities: Auth0Identity[];
	emailStatus?: string;
	errorStatus?: string;
	initialTab?: SettingsTab;
}) => {
	const queryClient = useQueryClient();
	const userQuery = useGetUser();
	const router = useRouter();
	const pathname = usePathname();

	const { setLoading, setLoadingMessage, setModalType, setErrors } =
		useAppContext();
	const { activeTab, setActiveTab, hasUnsavedChanges } = useSettingsContext();

	useEffect(() => {
		if (initialUser) {
			queryClient.setQueryData<UserToClientFromDB>(['user-get'], initialUser);
		}
	}, [initialUser, queryClient]);

	useEffect(() => {
		const validTabs: SettingsTab[] = [
			'account',
			'email',
			'sequences',
			'notifications',
		];
		if (initialTab && validTabs.includes(initialTab)) {
			setActiveTab(initialTab);
		}
	}, [initialTab, setActiveTab]);

	const userData = userQuery.data || initialUser;

	const tabs: { id: SettingsTab; label: string }[] = [
		{ id: 'account', label: 'Account' },
		{ id: 'email', label: 'Email & Templates' },
		{ id: 'sequences', label: 'Sequences' },
		{ id: 'notifications', label: 'Notifications' },
	];

	const renderTabContent = () => {
		if (!userData) {
			return null;
		}

		switch (activeTab) {
			case 'account':
				return <AccountSettings user={userData} identities={identities} />;
			case 'email':
				return (
					<EmailSettings
						user={userData}
						emailStatus={emailStatus}
						errorStatus={errorStatus}
					/>
				);
			case 'sequences':
				return <SequenceDefaults user={userData} />;
			case 'notifications':
				return <NotificationSettings user={userData} />;
			default:
				return <AccountSettings user={userData} identities={identities} />;
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
		router.push(`${pathname}?tab=${tabId}`, { scroll: false });
	};

	return (
		<div className={styles.settingsContainer}>
			<nav className={styles.nav}>
				{tabs.map((tab, index) => (
					<Fragment key={index}>
						<h2
							className={`${styles.tabButton} ${
								activeTab === tab.id ? styles.selected : ''
							}`}
							onClick={() => handleClick(tab.id)}
						>
							{tab.label}
						</h2>
						{index < tabs.length - 1 && <div className={styles.divider}></div>}
					</Fragment>
				))}
			</nav>

			<div className={styles.tabContent}>{renderTabContent()}</div>
		</div>
	);
};

export default SettingsClient;
