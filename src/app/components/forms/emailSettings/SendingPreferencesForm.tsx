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

const SendingPreferencesForm = ({ user }: { user: UserToClientFromDB }) => {
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

	interface SendingPreferencesFormData {
		trackOpens: boolean;
		trackClicks: boolean;
		autoMarkInvalid: boolean;
	}

	const { register, watch, handleSubmit, reset, setValue } =
		useForm<SendingPreferencesFormData>({
			defaultValues: {
				trackOpens: true,
				trackClicks: true,
				autoMarkInvalid: false,
			},
		});

	return (
		<div className={styles['account-settings-form-wrapper']}>
			<form className={styles.form}>
				<div className={`${styles['input-group']} ${styles['checkbox-group']}`}>
					<input type='checkbox' id='trackOpens' {...register('trackOpens')} />
					<div className={styles.input}>
						<label htmlFor='trackOpens'>
							<span>Track email opens</span>
						</label>
						<small className={styles.helpText}>
							Add tracking pixel to outbound emails
						</small>
					</div>
				</div>

				<div className={`${styles['input-group']} ${styles['checkbox-group']}`}>
					<input
						type='checkbox'
						id='trackClicks'
						{...register('trackClicks')}
					/>
					<div className={styles.input}>
						<label htmlFor='trackClicks'>
							<span>Track link clicks</span>
						</label>
						<small className={styles.helpText}>
							Monitor when recipients click links in your emails
						</small>
					</div>
				</div>

				<div className={`${styles['input-group']} ${styles['checkbox-group']}`}>
					<input
						type='checkbox'
						id='autoMarkInvalid'
						{...register('autoMarkInvalid')}
					/>
					<div className={styles.input}>
						<label htmlFor='autoMarkInvalid'>
							<span>Automatically mark contacts as invalid on hard bounce</span>
						</label>
						<small className={styles.helpText}>
							Prevents future emails to bounced addresses
						</small>
					</div>
				</div>

				<div className={styles['send-limit']}>
					<div className={styles.info}>
						<p>Daily Send Limit:</p>
						<p className={styles.limit}>20 emails</p>
					</div>
					<small>
						Your current plan allows up to 20 emails per day.{' '}
						<span
							className={styles.upgrade}
							onClick={() => setActiveTab('billing')}
						>
							Upgrade your plan to increase this limit.
						</span>
					</small>
				</div>

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

export default SendingPreferencesForm;
