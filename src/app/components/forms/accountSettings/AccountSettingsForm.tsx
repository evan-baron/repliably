'use client';

// Library imports
import { useState, useEffect } from 'react';
import { useForm, SubmitHandler, FieldErrors } from 'react-hook-form';
import Link from 'next/link';

// Hooks imports
import { useTimezoneSelect, allTimezones } from 'react-timezone-select';

// Styles imports
import styles from '../settingsForm.module.scss';

// Types imports
import { UserToClientFromDB } from '@/types/userTypes';

// Context imports
import { useAppContext } from '@/app/context/AppContext';
import { useSettingsContext } from '@/app/context/SettingsContext';

const AccountSettingsForm = ({ user }: { user: UserToClientFromDB }) => {
	const {
		modalType,
		setModalType,
		selectedContact,
		setSelectedContact,
		setErrors,
		setLoading,
		setLoadingMessage,
	} = useAppContext();
	const { isSaving, setIsSaving } = useSettingsContext();

	const labelStyle = 'original';
	const timezones = { ...allTimezones };
	const { options, parseTimezone } = useTimezoneSelect({
		labelStyle,
		timezones,
	});

	interface AccountFormData {
		firstName: string;
		lastName: string;
		timezone: string;
		role: string;
	}

	const defaultTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	// Find the matching option value for the user's timezone
	const findMatchingTimezone = (tz: string | null) => {
		if (!tz) return defaultTimezone;

		// First try exact match
		const exactMatch = options.find((opt) => opt.value === tz);

		if (exactMatch) return tz;

		// If no exact match, try to find by offset
		const userTzOption = parseTimezone(tz);
		const matchByOffset = options.find(
			(opt) => opt.offset === userTzOption.offset,
		);

		return matchByOffset?.value || defaultTimezone;
	};

	const { register, watch, handleSubmit, reset, setValue } =
		useForm<AccountFormData>({
			defaultValues: {
				firstName: user.firstName || '',
				lastName: user.lastName || '',
				timezone: user.timezone || findMatchingTimezone(defaultTimezone),
				role: user.role || 'user',
			},
		});

	// const handleSubmit = (e: React.FormEvent) => {
	// 	e.preventDefault();
	// 	// TODO: Implement save functionality
	// 	console.log('Saving account settings:', formData);
	// };

	// const handleChange = (
	// 	e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	// ) => {
	// 	const { name, value } = e.target;
	// 	setFormData((prev) => ({ ...prev, [name]: value }));
	// };

	return (
		<div className={styles['account-settings-form-wrapper']}>
			<form className={styles.form}>
				<div className={styles['input-group']}>
					<label htmlFor='firstName'>First Name</label>
					<input type='text' id='firstName' {...register('firstName')} />
				</div>

				<div className={styles['input-group']}>
					<label htmlFor='lastName'>Last Name</label>
					<input
						type='text'
						id='lastName'
						{...register('lastName')}
						placeholder='Enter last name'
					/>
				</div>

				<div className={styles['input-group']}>
					<label htmlFor='email'>Email Address</label>
					<div className={styles.input}>
						<input
							type='email'
							id='email'
							name='email'
							value={user.email}
							placeholder='Enter email address'
							disabled
						/>
						<small className={styles.helpText}>
							Email cannot be changed.{' '}
							<Link href='/support'>Contact support for assistance.</Link>
						</small>
					</div>
				</div>

				<div className={styles['input-group']}>
					<label htmlFor='timezone'>Timezone</label>
					<div className={styles.input}>
						<select id='timezone' {...register('timezone')}>
							{options.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
						<small className={styles.helpText}>
							Used for scheduling emails and displaying timestamps
						</small>
					</div>
				</div>

				<div className={styles['form-ctions']}>
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

export default AccountSettingsForm;
