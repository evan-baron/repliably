// Library imports
import React from 'react';
import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';

// Services imports
import { getAllPendingMessages } from '@/services/messageService';
import { findOrCreateUser } from '@/services/userService';
import { getApiUser } from '@/services/getUserService';

// Styles imports
import styles from './dashboard.module.scss';

// Components imports
import TopBar from '../components/pageSpecificComponents/dashboard/TopBar';
import SideBarClient from '../components/pageSpecificComponents/dashboard/sideBar/SideBarClient';
import Modal from '../components/modal/Modal';
import LoadingSpinner from '../components/loading/LoadingSpinner';

// Context
import { EmailContextProvider } from '../context/EmailContext';

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth0.getSession();
	const sessionUser = session?.user;

	// Redirect unauthenticated users to home
	if (!sessionUser) {
		redirect('/');
	}

	await findOrCreateUser(sessionUser);

	const { user } = await getApiUser();

	if (!user) {
		redirect('/');
	}

	console.log('user in dashboard layout:', user);

	const { emailConnectionActive } = user;

	const { messages } = await getAllPendingMessages();

	return (
		<EmailContextProvider>
			<div
				className={styles.dashboardLayout}
				role='application'
				aria-labelledby='app-title'
			>
				<TopBar userName={sessionUser?.given_name || 'User'} />

				<div className={styles.mainContent} role='main'>
					<SideBarClient
						initialMessages={messages}
						initialEmailConnectionActive={emailConnectionActive}
					/>

					<main
						className={styles.dashboardContent}
						role='main'
						aria-label='Dashboard main content'
						id='main-content'
						tabIndex={-1}
					>
						{children}
					</main>
				</div>
			</div>
			<Modal />
			<LoadingSpinner message='Loading' />
		</EmailContextProvider>
	);
}
