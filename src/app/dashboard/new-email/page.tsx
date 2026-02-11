// Libraries imports
import { redirect } from 'next/navigation';

// Services imports
import { getServerUser } from '@/services/getUserService';
import { getUserSettings } from '@/services/settingsService';

// Hooks imports

// Styles imports
import styles from './newEmail.module.scss';

// Components imports
import NewEmailForm from '../../components/forms/newEmail/NewEmailForm';

const Page = async () => {
	const { user, error } = await getServerUser();

	if (!user || error || !user.emailConnectionActive) {
		redirect('/');
	}

	const { signatures } = user;

	const { defaults } = await getUserSettings();

	const defaultSettings = {
		followUpCadence: '3day',
		autoSend: false,
		autoSendDelay: '',
		cadenceDuration: '60',
		referencePreviousEmail: false,
		alterSubjectLine: false,
	};

	return (
		<div className={styles['page-wrapper']}>
			<section className={styles['header-section']}>
				<h1 className={styles.welcomeTitle} id='email-title'>
					New Email
				</h1>
				<p className={styles.welcomeSubtitle} aria-describedby='email-title'>
					Write a new email or use a template to get started.
				</p>
			</section>

			<section className={styles['email-form-section']}>
				<NewEmailForm
					signatures={signatures}
					defaults={defaults || defaultSettings}
				/>
			</section>
		</div>
	);
};

export default Page;
