'use client';

// Library imports
import { useState } from 'react';

// Helpers imports
import { waitlistEmailSchema } from '@/lib/validation';

// Hooks imports
import { useJoinWaitlist } from '@/hooks/useWaitlist';

// Styles imports
import styles from './waitlist.module.scss';

// Icon imports

// Components imports

// Context imports
import { useAppContext } from '@/app/context/AppContext';

const Waitlist = () => {
	const { setModalType, setAlertMessage } = useAppContext();
	const [email, setEmail] = useState<string>('');
	const { mutateAsync: joinWaitlist, isPending: isJoiningWaitlist } =
		useJoinWaitlist();

	const validateEmail = (value: string) => {
		const trimmed = value.trim();
		const result = waitlistEmailSchema.safeParse({ email: trimmed });
		return result.success ? null : result.error.issues[0].message;
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEmail(e.target.value);
	};

	const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		const validationError = validateEmail(email);

		if (validationError) {
			setAlertMessage(validationError);
			setModalType('alert');
			return;
		}

		try {
			const response = await joinWaitlist(email.trim());
			if (response?.duplicate) {
				setAlertMessage(`Love the enthusiasm! You're already on the waitlist!`);
				setModalType('alert');
			} else {
				setAlertMessage(`Let's go! You've been added to the waitlist!`);
				setModalType('alert');
				setEmail('');
			}
			setEmail('');
		} catch (err: any) {
			console.error(err);
			setAlertMessage('Unable to join waitlist. Please try again.');
			setModalType('alert');
		}
	};

	const validatedEmail = validateEmail(email);
	const isButtonDisabled = !!validatedEmail || isJoiningWaitlist;

	return (
		<div
			className={styles['waitlist-wrapper']}
			aria-label='Waitlist sign-up form'
		>
			<div className={styles['input-wrapper']}>
				<label htmlFor='email' className={'sr-only'}>
					Email address
				</label>
				<input
					className={styles.input}
					id='email'
					type='email'
					placeholder='name@domain.com'
					autoComplete='email'
					aria-label='Email address input'
					value={email}
					onChange={handleChange}
				/>
				<button
					className={`${styles['get-started-button']} ${isButtonDisabled ? styles.disabled : ''}`}
					aria-label='Get started button'
					onClick={(e) => handleSubmit(e)}
					disabled={isButtonDisabled}
				>
					{isJoiningWaitlist ? 'Joining...' : 'Join the Waitlist'}
				</button>
			</div>
			<div className={styles['mobile-note']} aria-label='warning'>
				<p>
					Repliably is currently optimized for{' '}
					<span style={{ fontWeight: 'bold' }}>
						desktop and tablet use only
					</span>
					. Some features may not be available on mobile devices.
				</p>
			</div>
		</div>
	);
};

export default Waitlist;
