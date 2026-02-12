import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';

import styles from './home.module.scss';

// import AuthSection from './components/modals/modalTypes/auth/AuthSection';
import Modal from './components/modal/Modal';

export default async function Home() {
	const session = await auth0.getSession();
	const user = session?.user;

	if (user) {
		redirect('/dashboard');
	}

	return (
		<main
			className={styles['home-container']}
			role='main'
			aria-label='Login page'
			aria-labelledby='login-heading'
		>
			<div className='main-card-wrapper'>
				<section className='action-card' aria-labelledby='login-heading'>
					<h1 id='login-heading' className='sr-only'>
						Login
					</h1>
					<Modal backupModalType='auth' />
				</section>
			</div>
		</main>
	);
}
