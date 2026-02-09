'use client';

// Library imports
import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Link from 'next/link';

// Hooks imports
import { useTimezoneSelect, allTimezones } from 'react-timezone-select';
import { useUserAccountSettingsUpdate } from '@/hooks/useUserSettings';

// Styles imports
import styles from '../settingsForm.module.scss';

// Types imports
import { UserToClientFromDB } from '@/types/userTypes';

// Context imports
import { useAppContext } from '@/app/context/AppContext';

const AccountSettingsForm = ({ user }: { user: UserToClientFromDB }) => {
	const { setModalType, setErrors, setLoading, setLoadingMessage } =
		useAppContext();
	const { mutateAsync: updateUser, isPending: updatingUser } =
		useUserAccountSettingsUpdate();

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
	}

	const userClientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	// Find the matching option value for the user's timezone
	const findMatchingTimezone = (tz: string | null) => {
		if (!tz) return userClientTimezone;

		// First try exact match
		const exactMatch = options.find((opt) => opt.value === tz);

		if (exactMatch) return tz;

		// If no exact match, try to find by offset
		const userTzOption = parseTimezone(tz);
		const matchByOffset = options.find(
			(opt) => opt.offset === userTzOption.offset,
		);

		return matchByOffset?.value || userClientTimezone;
	};

	const defaultTimezone = findMatchingTimezone(userClientTimezone) || '';

	const initialValues = {
		firstName: user.firstName || '',
		lastName: user.lastName || '',
		timezone: user.timezone ? user.timezone : defaultTimezone,
	};

	const { register, watch, handleSubmit, reset, setValue } =
		useForm<AccountFormData>({
			defaultValues: initialValues,
		});

	// Watch all form fields
	const formValues = watch();

	// Check if form has changed
	const [hasChanged, setHasChanged] = useState(false);

	useEffect(() => {
		const isChanged =
			formValues.firstName !== initialValues.firstName ||
			formValues.lastName !== initialValues.lastName ||
			formValues.timezone !== initialValues.timezone;

		setHasChanged(isChanged);
	}, [formValues, initialValues]);

	const onSubmit: SubmitHandler<AccountFormData> = async (data) => {
		try {
			// Sanitize inputs - trim whitespace and remove dangerous characters
			const sanitizedData = {
				firstName: data.firstName.trim().replace(/[<>"/;`%]/g, ''),
				lastName: data.lastName.trim().replace(/[<>"/;`%]/g, ''),
				timezone: data.timezone,
			};

			// Additional validation
			if (
				sanitizedData.firstName.length < 1 ||
				sanitizedData.firstName.length > 50
			) {
				setErrors(['First name must be between 1 and 50 characters']);
				setModalType('error');
				return;
			}

			if (
				sanitizedData.lastName.length < 1 ||
				sanitizedData.lastName.length > 50
			) {
				setErrors(['Last name must be between 1 and 50 characters']);
				setModalType('error');
				return;
			}

			// Check for valid characters (letters, spaces, hyphens, apostrophes)
			const nameRegex = /^[a-zA-Z\s'-]+$/;
			if (!nameRegex.test(sanitizedData.firstName)) {
				setErrors(['First name contains invalid characters']);
				setModalType('error');
				return;
			}

			if (!nameRegex.test(sanitizedData.lastName)) {
				setErrors(['Last name contains invalid characters']);
				setModalType('error');
				return;
			}

			setLoading(true);
			setLoadingMessage('Saving');
			await updateUser({ ...sanitizedData });

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
		<div className={styles['settings-form-wrapper']}>
			<form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
				<div className={styles['input-group']}>
					<label htmlFor='firstName'>First Name</label>
					<input
						type='text'
						id='firstName'
						{...register('firstName', {
							required: 'First name is required',
							minLength: {
								value: 1,
								message: 'First name must be at least 1 characters',
							},
							maxLength: {
								value: 50,
								message: 'First name must be less than 50 characters',
							},
							pattern: {
								value: /^[a-zA-Z\s'-]+$/,
								message:
									'First name can only contain letters, spaces, hyphens, and apostrophes',
							},
						})}
					/>
				</div>

				<div className={styles['input-group']}>
					<label htmlFor='lastName'>Last Name</label>
					<input
						type='text'
						id='lastName'
						{...register('lastName', {
							required: 'Last name is required',
							minLength: {
								value: 1,
								message: 'Last name must be at least 1 characters',
							},
							maxLength: {
								value: 50,
								message: 'Last name must be less than 50 characters',
							},
							pattern: {
								value: /^[a-zA-Z\s'-]+$/,
								message:
									'Last name can only contain letters, spaces, hyphens, and apostrophes',
							},
						})}
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
							value={user.email || ''}
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
						disabled={updatingUser || !hasChanged}
					>
						Save Changes
					</button>
				</div>
			</form>
		</div>
	);
};

export default AccountSettingsForm;
