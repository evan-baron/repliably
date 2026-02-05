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
	const [formData, setFormData] = useState({
		autoSend: false,
		autoSendDelay: 3,
		sequenceDuration: 30,
		referencePreviousEmail: true,
		alterSubjectLine: false,
		needsApproval: true,
		approvalDeadlineHours: 24,
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// TODO: Implement save functionality
		console.log('Saving sequence defaults:', formData);
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value, type } = e.target;
		const checked = (e.target as HTMLInputElement).checked;

		setFormData((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));
	};

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
