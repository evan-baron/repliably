'use client';

// Library imports
import { useState, useEffect } from 'react';
import { useForm, SubmitHandler, FieldErrors } from 'react-hook-form';
import Link from 'next/link';

// Hooks imports
import { useTimezoneSelect, allTimezones } from 'react-timezone-select';

// Styles imports
import styles from './settings.module.scss';

// Types imports
import { UserToClientFromDB } from '@/types/userTypes';

// Context imports
import { useAppContext } from '@/app/context/AppContext';
import { useSettingsContext } from '@/app/context/SettingsContext';

// Components imports
import AccountSettingsForm from '@/app/components/forms/accountSettings/AccountSettingsForm';

const AccountSettings = ({ user }: { user: UserToClientFromDB }) => {
	const {
		modalType,
		setModalType,
		selectedContact,
		setSelectedContact,
		setErrors,
		setLoading,
		setLoadingMessage,
	} = useAppContext();

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
		<div className={styles['settings-container']}>
			<section className={styles.section}>
				<h3 className={styles['section-title']}>Profile Information</h3>
				<AccountSettingsForm user={user} />
			</section>

			<section className={styles.section}>
				<h3 className={styles['section-title']}>Account Security</h3>
				<div className={styles.options}>
					<div className={styles.item}>
						<div>
							<h4>Password</h4>
							<small>Manage your password through Auth0</small>
						</div>
						<button className={'button settings-button'}>
							Change Password
						</button>
					</div>

					<div className={styles.item}>
						<div>
							<h4>Two-Factor Authentication</h4>
							<small>Add an extra layer of security to your account</small>
						</div>
						<button className={'button settings-button'}>Enable 2FA</button>
					</div>

					<div className={styles.item}>
						<div>
							<h4>Active Sessions</h4>
							<small>Manage devices where you're currently logged in</small>
						</div>
						<button className={'button settings-button'}>View Sessions</button>
					</div>
				</div>
			</section>

			<section className={styles.section}>
				<h3 className={styles['section-title']}>Account Data</h3>
				<div className={styles.options}>
					<div className={styles.item}>
						<div>
							<h4>Export Data</h4>
							<small>Download all your contacts, messages, and sequences</small>
						</div>
						<button className={'button settings-button'}>Export Data</button>
					</div>

					<div className={styles.item}>
						<div>
							<h4>Delete Account</h4>
							<small className={styles.dangerText}>
								Permanently delete your account and all associated data
							</small>
						</div>
						<button className={'button delete-account'}>Delete Account</button>
					</div>
				</div>
			</section>
		</div>
	);
};

export default AccountSettings;
