'use client';

// Library imports
import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

// Hooks imports
import { useUserAccountSettingsUpdate } from '@/hooks/useUserSettings';

// Styles imports
import styles from '../settingsForm.module.scss';

// Types imports
import { UserToClientFromDB } from '@/types/userTypes';

// Context imports
import { useAppContext } from '@/app/context/AppContext';

const NotificationsForm = ({ user }: { user: UserToClientFromDB }) => {
	const { setLoading, setLoadingMessage } = useAppContext();
	const { mutateAsync: updateUser, isPending: updatingUser } =
		useUserAccountSettingsUpdate();

	interface NotificationsFormData {
		notificationBounce: boolean;
		notificationSequenceComplete: boolean;
		notificationMessageApproval: boolean;
		notificationSendFailure: boolean;
	}

	const initialValues = {
		notificationBounce: user.notificationBounce,
		notificationSequenceComplete: user.notificationSequenceComplete,
		notificationMessageApproval: user.notificationMessageApproval,
		notificationSendFailure: user.notificationSendFailure,
	};

	const { register, watch, handleSubmit, reset, setValue } =
		useForm<NotificationsFormData>({
			defaultValues: initialValues,
		});

	// Watch all form fields
	const formValues = watch();

	// Check if form has changed
	const [hasChanged, setHasChanged] = useState(false);

	useEffect(() => {
		const isChanged =
			formValues.notificationBounce !== initialValues.notificationBounce ||
			formValues.notificationSequenceComplete !==
				initialValues.notificationSequenceComplete ||
			formValues.notificationMessageApproval !==
				initialValues.notificationMessageApproval ||
			formValues.notificationSendFailure !==
				initialValues.notificationSendFailure;

		setHasChanged(isChanged);
	}, [formValues, initialValues]);

	const onSubmit: SubmitHandler<NotificationsFormData> = async (data) => {
		try {
			setLoading(true);
			setLoadingMessage('Saving');
			await updateUser({ ...data });

			// Delaying by a small amount to ensure the user sees the loading state
			setTimeout(() => {
				setLoading(false);
				setLoadingMessage(null);
			}, 800);
		} catch (error) {
			// Error handling is done in the hook
			setLoading(false);
			setLoadingMessage(null);
		}
	};

	return (
		// DELETE styles.disabled WHEN FEATURE IS READY
		<div className={`${styles['settings-form-wrapper']} ${styles.disabled}`}>
			<form
				className={styles.form}
				onSubmit={handleSubmit(onSubmit)}
				noValidate
				aria-label='Notification preferences form'
			>
				<h3
					className={styles['section-title']}
					style={{ opacity: '.5' }} // DELETE THIS LINE WHEN FEATURE IS READY
					id='contact-activity-section'
				>
					Contact Activity
				</h3>
				<section
					className={styles.section}
					aria-labelledby='contact-activity-section'
				>
					<div
						className={`${styles['input-group']} ${styles['checkbox-group']}`}
					>
						<input
							type='checkbox'
							id='notificationBounce'
							aria-describedby='notificationBounce-help'
							{...register('notificationBounce')}
							disabled // REMOVE WHEN FEATURE IS READY
							aria-disabled='true' // REMOVE WHEN FEATURE IS READY
						/>
						<div
							className={styles.input}
							style={{ opacity: '.5' }} // DELETE THIS LINE WHEN FEATURE IS READY
						>
							<label
								htmlFor='notificationBounce'
								className={styles.disabled} // DELETE THIS CLASS WHEN FEATURE IS READY
							>
								<span>Bounce Alerts</span>
							</label>
							<small id='notificationBounce-help' className={styles.helpText}>
								Get notified when an email bounces
							</small>
						</div>
					</div>

					<div
						className={`${styles['input-group']} ${styles['checkbox-group']}`}
					>
						<input
							type='checkbox'
							id='notificationSendFailure'
							aria-describedby='notificationSendFailure-help'
							{...register('notificationSendFailure')}
							disabled // REMOVE WHEN FEATURE IS READY
							aria-disabled='true' // REMOVE WHEN FEATURE IS READY
						/>
						<div
							className={styles.input}
							style={{ opacity: '.5' }} // DELETE THIS LINE WHEN FEATURE IS READY
						>
							<label
								htmlFor='notificationSendFailure'
								className={styles.disabled} // DELETE THIS CLASS WHEN FEATURE IS READY
							>
								<span>Send Failure</span>
							</label>
							<small
								id='notificationSendFailure-help'
								className={styles.helpText}
							>
								Get notified when a message fails to send
							</small>
						</div>
					</div>
				</section>

				<h3
					className={styles['section-title']}
					style={{ opacity: '.5' }} // DELETE THIS LINE WHEN FEATURE IS READY
					id='sequence-activity-section'
				>
					Sequence Activity
				</h3>
				<section
					className={styles.section}
					aria-labelledby='sequence-activity-section'
				>
					<div
						className={`${styles['input-group']} ${styles['checkbox-group']}`}
					>
						<input
							type='checkbox'
							id='notificationSequenceComplete'
							aria-describedby='notificationSequenceComplete-help'
							{...register('notificationSequenceComplete')}
							disabled // REMOVE WHEN FEATURE IS READY
							aria-disabled='true' // REMOVE WHEN FEATURE IS READY
						/>
						<div
							className={styles.input}
							style={{ opacity: '.5' }} // DELETE THIS LINE WHEN FEATURE IS READY
						>
							<label
								htmlFor='notificationSequenceComplete'
								className={styles.disabled} // DELETE THIS CLASS WHEN FEATURE IS READY
							>
								<span>Sequence Completion</span>
							</label>
							<small
								id='notificationSequenceComplete-help'
								className={styles.helpText}
							>
								Get notified when a sequence completes
							</small>
						</div>
					</div>

					<div
						className={`${styles['input-group']} ${styles['checkbox-group']}`}
					>
						<input
							type='checkbox'
							id='notificationMessageApproval'
							aria-describedby='notificationMessageApproval-help'
							{...register('notificationMessageApproval')}
							disabled // REMOVE WHEN FEATURE IS READY
							aria-disabled='true' // REMOVE WHEN FEATURE IS READY
						/>
						<div
							className={styles.input}
							style={{ opacity: '.5' }} // DELETE THIS LINE WHEN FEATURE IS READY
						>
							<label
								htmlFor='notificationMessageApproval'
								className={styles.disabled} // DELETE THIS CLASS WHEN FEATURE IS READY
							>
								<span>Message Approval</span>
							</label>
							<small
								id='notificationMessageApproval-help'
								className={styles.helpText}
							>
								Get notified when a message requires approval
							</small>
						</div>
					</div>
				</section>

				<div className={styles['form-actions']}>
					<button
						className={'button save-changes'}
						type='submit'
						disabled // REMOVE WHEN FEATURE IS READY AND REPLACE WITH BELOW LINE
						aria-disabled='true' // REMOVE WHEN FEATURE IS READY
						// disabled={updatingUser || !hasChanged}
					>
						{updatingUser ? 'Saving...' : 'Save Changes'}
					</button>
				</div>
			</form>
		</div>
	);
};

export default NotificationsForm;
