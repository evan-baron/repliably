// Library imports
import React from 'react';

// Hooks imports

// Styles imports
import styles from './contacts.module.scss';

// Components imports

const Page = () => {
	return (
		<div className={styles['page-wrapper']}>
			<section className={styles['header-section']}>
				<h1 className={styles.welcomeTitle} id='contacts-title'>
					Contacts
				</h1>
				<p className={styles.welcomeSubtitle} aria-describedby='contacts-title'>
					Add new contacts or search for existing ones.
				</p>
			</section>

			<section className={styles['contacts-section']}></section>
		</div>
	);
};

export default Page;
