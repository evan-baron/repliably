'use client';

// Library imports
import { useState, useEffect } from 'react';
import { useForm, SubmitHandler, FieldErrors } from 'react-hook-form';

// Hooks imports
import { useEmailSend } from '@/hooks/useEmail';

// Helper functions imports
import { parseTinyMceContent } from '@/lib/helpers/emailHelpers';

// Styles imports
import styles from './newEmailForm.module.scss';

// Types imports
import { SignatureFromDB, UserDefaultSettings } from '@/types/userTypes';

// Component imports
import TinyEditor from '../../tinyEditor/TinyEditor';

// Context imports
import { useAppContext } from '@/app/context/AppContext';
import { useEmailContext } from '@/app/context/EmailContext';

interface EmailFormData {
	to: string;
	subject: string;
	followUpCadence: string;
	autoSend: boolean;
	autoSendDelay: string;
	cadenceDuration: string;
	referencePreviousEmail?: boolean;
	alterSubjectLine?: boolean;
}

const NewEmailForm = ({
	contactEmail,
	signatures,
	defaults,
}: {
	contactEmail?: string;
	signatures?: SignatureFromDB[];
	defaults?: UserDefaultSettings;
}) => {
	const {
		modalType,
		setModalType,
		selectedContact,
		setSelectedContact,
		setErrors,
		setLoading,
		setLoadingMessage,
	} = useAppContext();
	const {
		resetForm,
		setResetForm,
		originalBodyContent,
		setOriginalBodyContent,
	} = useEmailContext();
	const { mutateAsync: sendEmail, isPending: sending } = useEmailSend();
	const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

	const defaultSignature = signatures?.find((signature) => signature.isDefault);
	const [selectedSignatureId, setSelectedSignatureId] = useState<number | null>(
		defaultSignature?.id || null,
	);
	const [signature, setSignature] = useState<string>(
		defaultSignature?.content || '',
	);

	const initialEditorContent = originalBodyContent + signature;

	const [editorContent, setEditorContent] = useState<string>(
		initialEditorContent || '',
	);

	// Handle signature change
	const handleSignatureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const signatureId = parseInt(e.target.value);
		setSelectedSignatureId(signatureId);
		setOriginalBodyContent(editorContent.replace(signature, '')); // Remove old signature from original content

		if (signatureId === -1) {
			setSignature('');
			return;
		}

		const selectedSignature = signatures?.find((sig) => sig.id === signatureId);
		if (selectedSignature) {
			setSignature(selectedSignature.content);
		}
	};

	const { register, watch, handleSubmit, reset, setValue } =
		useForm<EmailFormData>({
			defaultValues: {
				to: contactEmail || '',
				subject: '',
				...defaults,
			},
		});

	const autoSendChecked = watch('autoSend');
	const followingUp =
		watch('followUpCadence') !== 'none' && watch('followUpCadence') !== '';

	const extractFormErrors = (errors: FieldErrors<EmailFormData>): string[] => {
		return Object.values(errors)
			.map((error) => error?.message)
			.filter(Boolean) as string[];
	};

	useEffect(() => {
		if (selectedContact?.email && modalType !== 'newContactFromNewEmail') {
			setValue('to', selectedContact.email);
		}

		if (contactEmail) {
			setValue('to', contactEmail);
		}
	}, [selectedContact, contactEmail, modalType, setValue]);

	useEffect(() => {
		if (!followingUp) {
			setValue('referencePreviousEmail', false);
			setValue('alterSubjectLine', false);
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

		const parsedContent = parseTinyMceContent(editorContent);

		const referencePrevious =
			!data.followUpCadence || data.followUpCadence === 'none' ?
				null
			:	!!data.referencePreviousEmail;

		const alterSubject = !data.followUpCadence ? null : !!data.alterSubjectLine;

		try {
			setLoading(true);
			setLoadingMessage('Sending');
			const result = await sendEmail({
				to: contactEmail ? contactEmail : data.to,
				subject: data.subject || 'Email from Application',
				cadenceType: data.followUpCadence,
				autoSend: data.autoSend,
				autoSendDelay: data.autoSendDelay,
				cadenceDuration: data.cadenceDuration,
				referencePreviousEmail: referencePrevious,
				body: parsedContent,
				alterSubjectLine: alterSubject,
			});

			setLoading(false);
			setLoadingMessage(null);
			setEditorContent('');
			setSelectedContact(null);
			reset(); // Reset form fields

			const { newContact } = result;
			if (newContact) {
				setSelectedContact(result.contact);
				setModalType('newContactFromNewEmail');
			}
		} catch (error) {
			// Error handling is done in the hook
			setLoading(false);
			setLoadingMessage(null);
		}
	};

	return (
		<div className={styles['new-email-form-wrapper']}>
			<form
				onSubmit={handleSubmit(onSubmit, (errors) => {
					const errorMessages = extractFormErrors(errors);
					setErrors(errorMessages);
					setModalType('error');
				})}
				noValidate
				aria-label='New email form'
			>
				<div className={styles['form-email-wrapper']}>
					<section
						className={styles['form-email']}
						aria-labelledby='email-section'
					>
						{!contactEmail && <h2 id='email-section'>Email:</h2>}

						{/* To Field */}
						{!contactEmail && (
							<div className={styles['input-group']}>
								<div className={styles.input}>
									<label htmlFor='to'>To:</label>
									<input
										type='email'
										id='to'
										aria-required='true'
										aria-describedby='to-help'
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
										aria-label='Select recipient from contacts'
										title='Select from contacts'
									>
										...
									</button>
									<span id='to-help' className='sr-only'>
										Enter recipient email address or click button to select from
										contacts
									</span>
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
									aria-required='true'
									aria-describedby='subject-help'
									{...register('subject', {
										required: 'A subject line is required',
									})}
								/>
								<span id='subject-help' className='sr-only'>
									Enter the subject line for your email
								</span>
							</div>
						</div>

						{signatures && signatures.length > 0 && (
							<div className={styles['input-group']}>
								<div className={styles.input}>
									<label htmlFor='signatures'>Signature:</label>
									<select
										id='signatures'
										className={styles.select}
										value={selectedSignatureId || ''}
										onChange={handleSignatureChange}
										disabled={!signatures || signatures.length === 0}
										aria-disabled={!signatures || signatures.length === 0}
										aria-describedby='signatures-help'
									>
										<option value={-1}>None</option>
										{signatures?.map((signature) => (
											<option key={signature.id} value={signature.id}>
												{signature.name}
											</option>
										))}
									</select>
									<span id='signatures-help' className='sr-only'>
										Choose a signature to append to your email
									</span>
								</div>
							</div>
						)}

						{/* Email Body - RTE */}
						<div
							className={styles['rte-wrapper']}
							role='region'
							aria-label='Email body editor'
						>
							<TinyEditor
								initialValue={initialEditorContent ? initialEditorContent : ''}
								setEditorContent={setEditorContent}
								editorId={'new-email-editor'}
								aria-describedby='editor-help'
							/>
							<span id='editor-help' className='sr-only'>
								Compose the body of your email using the rich text editor
							</span>
						</div>
					</section>

					<section
						className={styles['form-settings']}
						aria-labelledby='automation-section'
					>
						<h2 id='automation-section'>Automation Settings:</h2>
						{/* Follow-up Cadence */}
						<div className={styles['input-group']}>
							<div className={styles.input}>
								<label htmlFor='followUpCadence'>Follow-up Cadence:</label>
								<select
									className={styles.select}
									id='followUpCadence'
									aria-required='true'
									aria-describedby='followUpCadence-help'
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
								<span id='followUpCadence-help' className='sr-only'>
									Select the frequency for follow-up emails
								</span>
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
										aria-describedby='cadenceDuration-help'
										{...register('cadenceDuration')}
									>
										<option value='30'>30 Days</option>
										<option value='60'>60 Days</option>
										<option value='90'>90 Days</option>
										<option value='indefinite'>Indefinite</option>
									</select>
									<small id='cadenceDuration-help' className='sr-only'>
										How long should the follow-up sequence continue
									</small>
								</div>
							</div>
						)}

						{followingUp && (
							<>
								{/* Reference Previous Emails in Follow-up */}
								<div className={styles['input-group']}>
									<div className={styles.input}>
										<label htmlFor='referencePreviousEmail'>
											Reference previous emails in follow-up:
										</label>
										<input
											className={styles.checkbox}
											type='checkbox'
											id='referencePreviousEmail'
											aria-describedby='referencePreviousEmail-help'
											{...register('referencePreviousEmail')}
										/>
										<small id='referencePreviousEmail-help' className='sr-only'>
											Reference previous emails in follow-up
										</small>
									</div>
								</div>

								{/* Let AI alter subject line for follow-up emails */}
								<div className={styles['input-group']}>
									<div className={styles.input}>
										<label htmlFor='alterSubjectLine'>
											Let AI alter subject line for follow-up emails:
										</label>
										<input
											className={styles.checkbox}
											type='checkbox'
											id='alterSubjectLine'
											aria-describedby='alterSubjectLine-help'
											{...register('alterSubjectLine')}
										/>
										<small id='alterSubjectLine-help' className='sr-only'>
											Allow AI to modify the subject line for better engagement
										</small>
									</div>
								</div>

								{/* Review Before Sending */}
								<div className={styles['input-group']}>
									<div className={styles.input}>
										<label htmlFor='autoSend'>
											Review before sending follow-up emails:
										</label>
										<input
											className={styles.checkbox}
											type='checkbox'
											id='autoSend'
											aria-describedby='autoSend-help'
											{...register('autoSend')}
										/>
										<small id='autoSend-help' className='sr-only'>
											Require manual approval before sending follow-ups
										</small>
									</div>
								</div>

								{/* Send without Review after */}
								{autoSendChecked && (
									<div className={styles['input-group']}>
										<div className={styles.input}>
											<label htmlFor='autoSendDelay'>
												Send email without review after:
											</label>
											<select
												className={styles.select}
												id='autoSendDelay'
												aria-required='true'
												aria-describedby='autoSendDelay-help'
												{...register('autoSendDelay', {
													validate: (value) =>
														!autoSendChecked || value !== '' ?
															true
														:	'Please select a review time frame',
												})}
											>
												<option value=''>Select time...</option>
												<option value='1'>1 Day</option>
												<option value='2'>2 Days</option>
												<option value='never'>Never</option>
											</select>
											<small id='autoSendDelay-help' className='sr-only'>
												Automatically send after this period if not reviewed
											</small>
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
							aria-disabled={sending}
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
