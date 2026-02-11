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
import { useSettingsContext } from '@/app/context/SettingsContext';

const SendingPreferencesForm = ({ user }: { user: UserToClientFromDB }) => {
	const { setLoading, setLoadingMessage } = useAppContext();
	const { setActiveTab } = useSettingsContext();
	const { mutateAsync: updateUser, isPending: updatingUser } =
		useUserAccountSettingsUpdate();

	interface SendingPreferencesFormData {
		trackEmailOpens: boolean;
		trackLinkClicks: boolean;
	}

	const initialValues = {
		trackEmailOpens: user.trackEmailOpens,
		trackLinkClicks: user.trackLinkClicks,
	};

	const { register, watch, handleSubmit, reset, setValue } =
		useForm<SendingPreferencesFormData>({
			defaultValues: initialValues,
		});

	// Watch all form fields
	const formValues = watch();

	// Check if form has changed
	const [hasChanged, setHasChanged] = useState(false);

	useEffect(() => {
		const isChanged =
			formValues.trackEmailOpens !== initialValues.trackEmailOpens ||
			formValues.trackLinkClicks !== initialValues.trackLinkClicks;

		setHasChanged(isChanged);
	}, [formValues, initialValues]);

	const onSubmit: SubmitHandler<SendingPreferencesFormData> = async (data) => {
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

	const sendLimitTiers = {
		free: 5,
		basic: 25,
		pro: 50,
		elite: Infinity,
	};

	const userLimit =
		user.subscriptionTier === 'elite' ?
			'Unlimited'
		:	sendLimitTiers[user.subscriptionTier];

	return (
		<div className={`${styles['settings-form-wrapper']} ${styles.disabled}`}>
			<form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
				<section className={styles.section}>
					<div
						className={`${styles['input-group']} ${styles['checkbox-group']}`}
					>
						<input
							type='checkbox'
							id='trackEmailOpens'
							{...register('trackEmailOpens')}
							disabled // REMOVE WHEN FEATURE IS READY
						/>
						<div
							className={styles.input}
							style={{ opacity: '.5' }} // DELETE THIS LINE WHEN FEATURE IS READY
						>
							<label
								htmlFor='trackEmailOpens'
								className={styles.disabled} // DELETE THIS CLASS WHEN FEATURE IS READY
							>
								<span>Track email opens</span>
							</label>
							<small className={styles.helpText}>
								Add tracking pixel to outbound emails
							</small>
						</div>
					</div>

					<div
						className={`${styles['input-group']} ${styles['checkbox-group']}`}
					>
						<input
							type='checkbox'
							id='trackLinkClicks'
							{...register('trackLinkClicks')}
							disabled // REMOVE WHEN FEATURE IS READY
						/>
						<div
							className={styles.input}
							style={{ opacity: '.5' }} // DELETE THIS LINE WHEN FEATURE IS READY
						>
							<label
								htmlFor='trackLinkClicks'
								className={styles.disabled} // DELETE THIS CLASS WHEN FEATURE IS READY
							>
								<span>Track link clicks</span>
							</label>
							<small className={styles.helpText}>
								Monitor when recipients click links in your emails
							</small>
						</div>
					</div>

					<div className={styles['send-limit']}>
						<div className={styles.info}>
							<p>Daily Send Limit:</p>
							<p className={styles.limit}>
								{userLimit}
								{user.subscriptionTier !== 'elite' ? ' emails' : ''}
							</p>
						</div>
						<small>
							{user.subscriptionTier !== 'elite' ?
								`Your current plan allows up to ${userLimit} outbound emails per
							day.`
							:	'Your current plan allows unlimited outbound emails. Thank you for being an elite subscriber!'
							}{' '}
							{user.subscriptionTier !== 'elite' ?
								<span
									className={styles.upgrade}
									onClick={() => setActiveTab('billing')}
								>
									Upgrade your plan to increase this limit.
								</span>
							:	<span className={styles.important}>
									<br />
									Note: Standard email providers enforce a maximum of 500 emails
									per day to prevent spam.
								</span>
							}
						</small>
					</div>
				</section>

				<div className={styles['form-actions']}>
					<button
						className={'button save-changes'}
						type='submit'
						disabled={!hasChanged || updatingUser}
					>
						{updatingUser ? 'Saving...' : 'Save Changes'}
					</button>
				</div>
			</form>
		</div>
	);
};

export default SendingPreferencesForm;
