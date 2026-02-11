'use client';

// Library imports
import { useState } from 'react';

// Styles imports
import styles from './settings.module.scss';

// Types imports
import { UserToClientFromDB } from '@/types/userTypes';

// Components imports
import SequenceDefaultsForm from '../../forms/sequenceDefaultSettings/SequenceDefaultsForm';

const SequenceDefaults = ({ user }: { user: UserToClientFromDB }) => {
	return (
		<div className={styles['settings-container']}>
			<section className={styles.section}>
				<h3 className={styles['section-title']}>Default Sequence Settings</h3>
				<p className={styles['section-description']}>
					Configure default settings for new sequences.{' '}
					<span className={styles.important}>
						These can be overridden when creating individual sequences.
					</span>
				</p>

				<SequenceDefaultsForm user={user} />
			</section>
		</div>
	);
};

export default SequenceDefaults;
