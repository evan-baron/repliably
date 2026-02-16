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
					<svg
						version='1.2'
						xmlns='http://www.w3.org/2000/svg'
						viewBox='0 0 464 304'
						width='464'
						height='304'
						className={styles.svg1}
					>
						<path
							id='Path0'
							d='m446.5 0.02l5 2.85c2.75 1.57 6.23 4.61 7.73 6.74 1.51 2.14 3.19 5.46 3.75 7.39 0.67 2.3 1.02 48.71 1 135-0.01 101.43-0.3 132.4-1.25 135.42-0.67 2.15-2.84 5.75-4.81 8-1.96 2.24-5.67 5.09-12.92 8.58h-426l-4.67-2.25c-2.58-1.24-6.29-4.09-8.25-6.33-1.97-2.25-4.14-5.85-4.81-8-0.96-3.03-1.24-34.15-1.23-136.42 0-125.79 0.1-132.7 1.82-136.5 0.99-2.2 3.35-5.54 5.22-7.42 1.88-1.87 5.22-4.23 7.42-5.22 3.82-1.74 13.53-1.82 432-1.84zm-275.5 86.31c32.73 20.14 60.18 36.61 61 36.61 0.82 0 28.27-16.47 61-36.61 32.73-20.13 59.93-36.99 60.45-37.47 0.53-0.48-52.78-0.87-121.5-0.88-70.54-0.01-122.03 0.36-121.45 0.87 0.55 0.48 27.77 17.35 60.5 37.48zm-123 169.67h368v-189c-19.76 12.16-58.8 36.16-99.5 61.19-40.7 25.03-75.57 46.03-77.5 46.67-1.93 0.65-5.07 1.17-7 1.17-1.93 0-5.07-0.52-7-1.17-1.93-0.64-36.8-21.64-77.5-46.67-40.7-25.03-79.74-49.03-86.76-53.34l-12.76-7.84z'
						/>
					</svg>
					<svg
						version='1.2'
						xmlns='http://www.w3.org/2000/svg'
						viewBox='0 0 464 304'
						width='464'
						height='304'
						className={styles.svg2}
					>
						<path
							id='Path0'
							d='m446.5 0.02l5 2.85c2.75 1.57 6.23 4.61 7.73 6.74 1.51 2.14 3.19 5.46 3.75 7.39 0.67 2.3 1.02 48.71 1 135-0.01 101.43-0.3 132.4-1.25 135.42-0.67 2.15-2.84 5.75-4.81 8-1.96 2.24-5.67 5.09-12.92 8.58h-426l-4.67-2.25c-2.58-1.24-6.29-4.09-8.25-6.33-1.97-2.25-4.14-5.85-4.81-8-0.96-3.03-1.24-34.15-1.23-136.42 0-125.79 0.1-132.7 1.82-136.5 0.99-2.2 3.35-5.54 5.22-7.42 1.88-1.87 5.22-4.23 7.42-5.22 3.82-1.74 13.53-1.82 432-1.84zm-275.5 86.31c32.73 20.14 60.18 36.61 61 36.61 0.82 0 28.27-16.47 61-36.61 32.73-20.13 59.93-36.99 60.45-37.47 0.53-0.48-52.78-0.87-121.5-0.88-70.54-0.01-122.03 0.36-121.45 0.87 0.55 0.48 27.77 17.35 60.5 37.48zm-123 169.67h368v-189c-19.76 12.16-58.8 36.16-99.5 61.19-40.7 25.03-75.57 46.03-77.5 46.67-1.93 0.65-5.07 1.17-7 1.17-1.93 0-5.07-0.52-7-1.17-1.93-0.64-36.8-21.64-77.5-46.67-40.7-25.03-79.74-49.03-86.76-53.34l-12.76-7.84z'
						/>
					</svg>
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
