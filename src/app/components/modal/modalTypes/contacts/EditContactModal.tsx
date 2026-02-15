// Library imports
import { useForm, SubmitHandler } from 'react-hook-form';

// Hooks imports
import { useContactUpdate } from '@/hooks/useContact';

// Types imports
import { ContactFromDB, ContactFormData } from '@/types/contactTypes';

// Styles imports
import styles from './newContactModal.module.scss';

// Context imports
import { useAppContext } from '@/app/context/AppContext';

const EditContactModal = ({
	selectedContact,
}: {
	selectedContact?: ContactFromDB;
}) => {
	if (!selectedContact) {
		return null;
	}

	const {
		setModalType,
		setSelectedContact,
		setLoading,
		setLoadingMessage,
	} = useAppContext();
	const { mutateAsync: updateContact, isPending: updating } =
		useContactUpdate();

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		setError,
	} = useForm<ContactFormData>({
		defaultValues: {
			firstName: selectedContact.firstName || '',
			lastName: selectedContact.lastName || '',
			company: selectedContact.company || '',
			title: selectedContact.title || '',
			email: selectedContact.email || '',
			phone: selectedContact.phone || '',
			linkedIn: selectedContact.linkedIn || '',
			importance:
				(
					selectedContact.importance !== undefined &&
					selectedContact.importance !== null
				) ?
					String(selectedContact.importance)
				:	'',
			reasonForEmail: selectedContact.reasonForEmail || '',
		},
	});

	const onSubmit: SubmitHandler<ContactFormData> = async (data) => {
		try {
			setLoading(true);
			setLoadingMessage('Saving');
			await updateContact({ id: selectedContact.id, ...data });
			// Handle success
			reset();
			setModalType(null);
			setSelectedContact(null);
			setLoading(false);
			setLoadingMessage(null);
		} catch (error) {
			setLoading(false);
			setLoadingMessage(null);
			if (
				error instanceof Error &&
				error.message === 'Contact with this email already exists'
			) {
				setError('email', {
					message: 'A contact with this email already exists',
				});
			}
		}
	};

	const handleCancel = () => {
		reset();
		setModalType(null);
		setSelectedContact(null);
	};

	return (
		<div
			className={styles['newcontact-modal-wrapper']}
			role='dialog'
			aria-labelledby='edit-contact-title'
			aria-modal='true'
		>
			<h2 id='edit-contact-title' className='sr-only'>
				Edit Contact
			</h2>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className={styles['contact-form']}
				noValidate
				aria-label='Edit contact form'
			>
				{/* Name Fields */}
				<div className={styles['form-row']}>
					<div className={styles['input-group']}>
						<label htmlFor='first'>First Name *</label>
						<input
							type='text'
							id='firstName'
							{...register('firstName', {
								required: 'First name is required',
								minLength: {
									value: 2,
									message: 'First name must be at least 2 characters',
								},
							})}
							className={errors.firstName ? styles.error : ''}
							aria-required='true'
							aria-invalid={errors.firstName ? 'true' : 'false'}
							aria-describedby={
								errors.firstName ? 'firstName-error' : undefined
							}
						/>
						{errors.firstName && (
							<span
								id='firstName-error'
								className={styles['error-message']}
								role='alert'
							>
								{errors.firstName.message}
							</span>
						)}
					</div>

					<div className={styles['input-group']}>
						<label htmlFor='last'>Last Name *</label>
						<input
							type='text'
							id='lastName'
							{...register('lastName', {
								required: 'Last name is required',
								minLength: {
									value: 2,
									message: 'Last name must be at least 2 characters',
								},
							})}
							className={errors.lastName ? styles.error : ''}
							aria-required='true'
							aria-invalid={errors.lastName ? 'true' : 'false'}
							aria-describedby={errors.lastName ? 'lastName-error' : undefined}
						/>
						{errors.lastName && (
							<span
								id='lastName-error'
								className={styles['error-message']}
								role='alert'
							>
								{errors.lastName.message}
							</span>
						)}
					</div>
				</div>

				{/* Company and Title */}
				<div className={styles['form-row']}>
					<div className={styles['input-group']}>
						<label htmlFor='company'>Company</label>
						<input type='text' id='company' {...register('company')} />
					</div>

					<div className={styles['input-group']}>
						<label htmlFor='title'>Title</label>
						<input type='text' id='title' {...register('title')} />
					</div>
				</div>

				{/* Contact Information */}
				<div className={styles['form-row']}>
					<div className={styles['input-group']}>
						<label htmlFor='email'>Email *</label>
						<input
							type='email'
							id='email'
							{...register('email', {
								required: 'Email is required',
								pattern: {
									value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
									message: 'Invalid email address',
								},
							})}
							className={errors.email ? styles.error : ''}
							aria-required='true'
							aria-invalid={errors.email ? 'true' : 'false'}
							aria-describedby={errors.email ? 'email-error' : undefined}
						/>
						{errors.email && (
							<span
								id='email-error'
								className={styles['error-message']}
								role='alert'
							>
								{errors.email.message}
							</span>
						)}
					</div>

					<div className={styles['input-group']}>
						<label htmlFor='phone'>Phone</label>
						<input type='tel' id='phone' {...register('phone')} />
					</div>
				</div>

				{/* LinkedIn and Importance */}
				<div className={styles['form-row']}>
					<div className={styles['input-group']}>
						<label htmlFor='linkedin'>LinkedIn Profile</label>
						<input
							type='url'
							id='linkedIn'
							{...register('linkedIn', {
								pattern: {
									value: /^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/i,
									message: 'Please enter a valid LinkedIn URL',
								},
								onChange: (e) => {
									const value = e.target.value;
									if (
										value &&
										!value.startsWith('http') &&
										(value.startsWith('www') || value.startsWith('linkedin'))
									) {
										e.target.value = `https://${value}`;
									}
								},
							})}
							placeholder='https://'
							className={errors.linkedIn ? styles.error : ''}
							aria-invalid={errors.linkedIn ? 'true' : 'false'}
							aria-describedby={errors.linkedIn ? 'linkedIn-error' : undefined}
						/>
						{errors.linkedIn && (
							<span
								id='linkedIn-error'
								className={styles['error-message']}
								role='alert'
							>
								{errors.linkedIn.message}
							</span>
						)}
					</div>

					<div className={styles['input-group']}>
						<label htmlFor='importance'>Importance</label>
						<select id='importance' {...register('importance')}>
							<option value=''>Select importance...</option>
							<option value='1'>1 - Lowest</option>
							<option value='2'>2 - Low</option>
							<option value='3'>3 - Medium</option>
							<option value='4'>4 - High</option>
							<option value='5'>5 - Highest</option>
						</select>
					</div>
				</div>

				{/* Additional Fields */}
				<div className={styles['input-group']}>
					<label htmlFor='reasonForEmail'>Reason for Reaching Out:</label>
					<input
						type='text'
						id='reasonForEmail'
						{...register('reasonForEmail')}
						className={errors.reasonForEmail ? styles.error : ''}
						placeholder='ex: Applied for Junior Engineer role'
						aria-invalid={errors.reasonForEmail ? 'true' : 'false'}
						aria-describedby={
							errors.reasonForEmail ? 'reasonForEmail-error' : undefined
						}
					/>
					{errors.reasonForEmail && (
						<span
							id='reasonForEmail-error'
							className={styles['error-message']}
							role='alert'
						>
							{errors.reasonForEmail.message}
						</span>
					)}
				</div>

				{/* Action Buttons */}
				<div className={styles['form-actions']}>
					<button
						type='submit'
						className={`${styles['save-button']} button contact`}
						disabled={updating}
						aria-disabled={updating}
					>
						{updating ? 'Saving...' : 'Save Changes'}
					</button>
					<button
						type='button'
						name='cancel'
						onClick={handleCancel}
						className={`${styles['cancel-button']} button`}
						disabled={updating}
						aria-disabled={updating}
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	);
};

export default EditContactModal;
