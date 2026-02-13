// Libraries imports
import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import Link from 'next/link';

// Styles imports
import styles from './home.module.scss';

// Components imports
import LoginModal from './components/modal/modalTypes/auth/login/LoginModal';
import Waitlist from './components/pageSpecificComponents/home/waitlist/Waitlist';
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
			aria-labelledby='home-heading'
		>
			<section className={styles.left}>
				<div className={styles['left-contents']}>
					<div className={styles['home-heading']}>
						<h1 id='home-heading'>Welcome to Repliably</h1>
					</div>
					<p className={styles['home-description']}>
						Repliably is an email automation tool designed to help job seekers
						manage their job applications and follow-ups efficiently. With
						Repliably, you can create personalized email templates, schedule
						automated follow-ups, and track your email outreach data all in one
						place.
					</p>
					<p className={styles['home-description']}>
						Say goodbye to manual emailing and hello to a more sophisticated
						follow-up strategy with Repliably!
					</p>
					<Waitlist />
					<div className={styles['important-links']}>
						<Link className={styles.link} href='/terms'>
							Terms of Service
						</Link>
						<Link className={styles.link} href='/privacy'>
							Privacy Policy
						</Link>
					</div>
				</div>
			</section>
			<section className={styles.right} aria-labelledby='login-heading'>
				<label id='login-heading' className='sr-only'>
					Login
				</label>
				<div className={styles['login-wrapper']}>
					<h2>Already have an account?</h2>
					<LoginModal />
				</div>
			</section>
			<Modal />
		</main>
	);
}
