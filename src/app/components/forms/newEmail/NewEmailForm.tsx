'use client';

// Library imports
import { useState, useEffect } from 'react';
import { useForm, SubmitHandler, FieldErrors } from 'react-hook-form';

// Hooks imports
import { useEmailSend } from '@/hooks/useEmail';

// Styles imports
import styles from './newEmailForm.module.scss';

// Component imports
import TinyEditor from '../../editor/TinyEditor';

// Context imports
import { useAppContext } from '@/app/context/AppContext';
import { useEmailContext } from '@/app/context/EmailContext';

interface EmailFormData {
	to: string;
	subject: string;
	followUpCadence: string;
	reviewBeforeSending: boolean;
	sendWithoutReviewAfter: string;
	cadenceDuration: string;
	referencePreviousEmail?: boolean;
}

const NewEmailForm = ({ contactEmail }: { contactEmail?: string }) => {
	const { setModalType, selectedContact, setSelectedContact, setErrors } =
		useAppContext();
	const { resetForm, setResetForm } = useEmailContext();

	const { mutateAsync: sendEmail, isPending: sending } = useEmailSend();

	const [editorContent, setEditorContent] = useState<string>('');

	const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

	const { register, watch, handleSubmit, reset, setValue } =
		useForm<EmailFormData>({
			defaultValues: {
				to: contactEmail || '',
				subject: '',
				followUpCadence: '3day',
				reviewBeforeSending: false,
				sendWithoutReviewAfter: '',
				cadenceDuration: '30',
				referencePreviousEmail: true,
			},
		});

	const extractFormErrors = (errors: FieldErrors<EmailFormData>): string[] => {
		return Object.values(errors)
			.map((error) => error?.message)
			.filter(Boolean) as string[];
	};

	const reviewBeforeSendingChecked = watch('reviewBeforeSending');
	const followingUp =
		watch('followUpCadence') !== 'none' && watch('followUpCadence') !== '';

	useEffect(() => {
		if (selectedContact?.email) {
			setValue('to', selectedContact.email);
		}

		if (contactEmail) {
			setValue('to', contactEmail);
		}
	}, [selectedContact, contactEmail, setValue]);

	useEffect(() => {
		if (!followingUp) {
			setValue('referencePreviousEmail', false);
		}
	}, [followingUp, setValue]);

	useEffect(() => {
		resetForm && reset();
		setResetForm(false);
	}, [resetForm, setResetForm]);

	const onSubmit: SubmitHandler<EmailFormData> = async (data) => {
		if (!editorContent || editorContent.trim() === '') {
			setErrors(['Email cannot be empty.']);
			setModalType('error');
			return;
		}

		const referencePrevious =
			!data.followUpCadence || data.followUpCadence === 'none'
				? null
				: !!data.referencePreviousEmail;

		try {
			await sendEmail({
				to: contactEmail ? contactEmail : data.to,
				subject: data.subject || 'Email from Application',
				cadenceType: data.followUpCadence,
				reviewBeforeSending: data.reviewBeforeSending,
				sendWithoutReviewAfter: data.sendWithoutReviewAfter,
				cadenceDuration: data.cadenceDuration,
				referencePreviousEmail: referencePrevious,
				body: editorContent,
			});

			// Success handling is done in the hook
			setEditorContent('');
			setSelectedContact(null);
			reset(); // Reset form fields
		} catch (error) {
			// Error handling is done in the hook
		}
	};

	return (
		<div className={styles['newemailform-wrapper']}>
			<form
				onSubmit={handleSubmit(onSubmit, (errors) => {
					const errorMessages = extractFormErrors(errors);
					setErrors(errorMessages);
					setModalType('error');
				})}
			>
				<div className={styles['form-email-wrapper']}>
					<section className={styles['form-email']}>
						{!contactEmail && <h2>Email:</h2>}

						{/* To Field */}
						{!contactEmail && (
							<div className={styles['input-group']}>
								<div className={styles.input}>
									<label htmlFor='to'>To:</label>
									<input
										type='email'
										id='to'
										{...register('to', {
											required: "A 'To:' email address is required",
											pattern: {
												value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
												message: 'Invalid email address',
											},
										})}
									/>
									<button
										type='button'
										className={styles['contact-select']}
										data-tooltip='Select from contacts'
										onClick={() => setModalType('searchContacts')}
									>
										...
									</button>
								</div>
							</div>
						)}

						{/* Subject Field */}
						<div className={styles['input-group']}>
							<div className={styles.input}>
								<label htmlFor='subject'>Subject:</label>
								<input
									type='text'
									id='subject'
									{...register('subject', {
										required: 'A subject line is required',
									})}
								/>
							</div>
						</div>

						{/* Email Body - RTE */}
						<div className={styles['rte-wrapper']}>
							<TinyEditor setEditorContent={setEditorContent} />
						</div>
					</section>

					<section className={styles['form-settings']}>
						<h2>Automation Settings:</h2>
						{/* Follow-up Cadence */}
						<div className={styles['input-group']}>
							<div className={styles.input}>
								<label htmlFor='followUpCadence'>*Follow-up Cadence:</label>
								<select
									className={styles.select}
									id='followUpCadence'
									{...register('followUpCadence', {
										required: 'Please select a follow-up cadence',
									})}
								>
									<option value='3day'>Every 3 days</option>
									<option value='31day'>3... 1... 3... 1... Repeat</option>
									<option value='weekly'>Weekly on {today}</option>
									<option value='biweekly'>Bi-weekly on {today}</option>
									<option value='monthly'>Every 4 weeks on {today}</option>
									<option value='none'>No Follow-up</option>
								</select>
							</div>
						</div>

						{/* Cadence Duration */}
						{followingUp && (
							<div className={styles['input-group']}>
								<div className={styles.input}>
									<label htmlFor='cadenceDuration'>Cadence Duration:</label>
									<select
										className={styles.select}
										id='cadenceDuration'
										{...register('cadenceDuration')}
									>
										<option value='30'>30 Days</option>
										<option value='60'>60 Days</option>
										<option value='90'>90 Days</option>
										<option value='indefinite'>Indefinite</option>
									</select>
								</div>
							</div>
						)}

						{followingUp && (
							<>
								{/* Reference Previous Emails in Follow-up */}
								<div className={styles['input-group']}>
									<div className={styles.input}>
										<label htmlFor='referencePreviousEmail'>
											Reference Previous Emails in Follow-up:
										</label>
										<input
											className={styles.checkbox}
											type='checkbox'
											id='referencePreviousEmail'
											{...register('referencePreviousEmail')}
											defaultChecked={true}
										/>
									</div>
								</div>

								{/* Review Before Sending */}
								<div className={styles['input-group']}>
									<div className={styles.input}>
										<label htmlFor='reviewBeforeSending'>
											Review Before Sending:
										</label>
										<input
											className={styles.checkbox}
											type='checkbox'
											id='reviewBeforeSending'
											{...register('reviewBeforeSending')}
										/>
									</div>
								</div>

								{/* Send without Review after */}
								{reviewBeforeSendingChecked && (
									<div className={styles['input-group']}>
										<div className={styles.input}>
											<label htmlFor='sendWithoutReviewAfter'>
												Send without Review after:
											</label>
											<select
												className={styles.select}
												id='sendWithoutReviewAfter'
												{...register('sendWithoutReviewAfter', {
													validate: (value) =>
														!reviewBeforeSendingChecked || value !== ''
															? true
															: 'Please select a review time frame',
												})}
											>
												<option value=''>Select time...</option>
												<option value='1'>1 Day</option>
												<option value='2'>2 Days</option>
												<option value='never'>Never</option>
											</select>
										</div>
									</div>
								)}
							</>
						)}

						{/* Send Buttons */}
						<button
							className={'button send-email'}
							type='submit'
							disabled={sending}
						>
							{sending ? 'Sending...' : 'Send Email'}
						</button>
					</section>
				</div>
			</form>
		</div>
	);
};

export default NewEmailForm;
