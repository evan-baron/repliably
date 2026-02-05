'use client';

// Library imports
import { useState, useEffect } from 'react';
import { useForm, SubmitHandler, FieldErrors } from 'react-hook-form';
import Link from 'next/link';

// Styles imports
import styles from '../settingsForm.module.scss';

// Types imports
import { UserToClientFromDB } from '@/types/userTypes';

// Context imports
import { useAppContext } from '@/app/context/AppContext';
import { useSettingsContext } from '@/app/context/SettingsContext';

const NotificationsForm = ({ user }: { user: UserToClientFromDB }) => {
	const {
		modalType,
		setModalType,
		selectedContact,
		setSelectedContact,
		setErrors,
		setLoading,
		setLoadingMessage,
	} = useAppContext();
	const { isSaving, setIsSaving, setActiveTab } = useSettingsContext();

	interface NotificationsFormData {
		bounceAlerts: boolean;
		sequenceCompletion: boolean;
		messageApproval: boolean;
		sendFailure: boolean;
	}

	const { register, watch, handleSubmit, reset, setValue } =
		useForm<NotificationsFormData>({
			defaultValues: {
				bounceAlerts: true,
				sequenceCompletion: true,
				messageApproval: true,
				sendFailure: true,
			},
		});

	return (
		<div className={styles['settings-form-wrapper']}>
			<form className={styles.form}>
				<h3 className={styles['section-title']}>Contact Activity</h3>
				<section className={styles.section}>
					<div
						className={`${styles['input-group']} ${styles['checkbox-group']}`}
					>
						<input
							type='checkbox'
							id='bounceAlerts'
							{...register('bounceAlerts')}
						/>
						<div className={styles.input}>
							<label htmlFor='bounceAlerts'>
								<span>Bounce Alerts</span>
							</label>
							<small className={styles.helpText}>
								Get notified when an email bounces
							</small>
						</div>
					</div>

					<div
						className={`${styles['input-group']} ${styles['checkbox-group']}`}
					>
						<input
							type='checkbox'
							id='sendFailure'
							{...register('sendFailure')}
						/>
						<div className={styles.input}>
							<label htmlFor='sendFailure'>
								<span>Send Failure</span>
							</label>
							<small className={styles.helpText}>
								Get notified when a message fails to send
							</small>
						</div>
					</div>
				</section>

				<h3 className={styles['section-title']}>Sequence Activity</h3>
				<section className={styles.section}>
					<div
						className={`${styles['input-group']} ${styles['checkbox-group']}`}
					>
						<input
							type='checkbox'
							id='sequenceCompletion'
							{...register('sequenceCompletion')}
						/>
						<div className={styles.input}>
							<label htmlFor='sequenceCompletion'>
								<span>Sequence Completion</span>
							</label>
							<small className={styles.helpText}>
								Get notified when a sequence completes
							</small>
						</div>
					</div>

					<div
						className={`${styles['input-group']} ${styles['checkbox-group']}`}
					>
						<input
							type='checkbox'
							id='messageApproval'
							{...register('messageApproval')}
						/>
						<div className={styles.input}>
							<label htmlFor='messageApproval'>
								<span>Message Approval</span>
							</label>
							<small className={styles.helpText}>
								Get notified when a message requires approval
							</small>
						</div>
					</div>
				</section>

				<div className={styles['form-actions']}>
					<button
						className={'button save-changes'}
						type='submit'
						disabled={isSaving}
					>
						{isSaving ? 'Saving...' : 'Save Changes'}
					</button>
				</div>
			</form>
		</div>
	);
};

export default NotificationsForm;
