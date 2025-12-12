// Library imports
import React from 'react';

// Hooks imports

// Styles imports
import styles from './newEmail.module.scss';

// Components imports
import NewEmailForm from '../../components/forms/newEmail/NewEmailForm';

const Page = () => {
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
				<NewEmailForm />
			</section>
		</div>
	);
};

export default Page;
