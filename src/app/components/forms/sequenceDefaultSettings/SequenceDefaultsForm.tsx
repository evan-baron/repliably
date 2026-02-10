'use client';

// Library imports
import { useState, useEffect } from 'react';
import { useForm, SubmitHandler, FieldErrors } from 'react-hook-form';

// Hooks imports
import { useUserAccountSettingsUpdate } from '@/hooks/useUserSettings';

// Styles imports
import styles from '../settingsForm.module.scss';

// Types imports
import { UserToClientFromDB } from '@/types/userTypes';

// Context imports
import { useAppContext } from '@/app/context/AppContext';

const SequenceDefaultsForm = ({ user }: { user: UserToClientFromDB }) => {
	const {
		modalType,
		setModalType,
		selectedContact,
		setSelectedContact,
		setErrors,
		setLoading,
		setLoadingMessage,
	} = useAppContext();
	const { mutateAsync: updateUser, isPending: updatingUser } =
		useUserAccountSettingsUpdate();

	interface SequenceDefaultsFormData {
		defaultRequireApproval: boolean;
		defaultSequenceDuration: number;
		defaultReferencePrevious: boolean;
		defaultAlterSubjectLine: boolean;
		defaultSendDelay: number;
		defaultSequenceType: number;
	}

	const initialValues = {
		defaultRequireApproval: user.defaultRequireApproval ?? false,
		defaultSequenceDuration:
			!user.defaultSequenceDuration ? -1 : (user.defaultSequenceDuration ?? 60),
		defaultReferencePrevious: user.defaultReferencePrevious ?? true,
		defaultAlterSubjectLine: user.defaultAlterSubjectLine ?? false,
		defaultSendDelay: user.defaultSendDelay ?? 0,
		defaultSequenceType: user.defaultSequenceType ?? 3,
	};

	const { register, watch, handleSubmit, reset, setValue } =
		useForm<SequenceDefaultsFormData>({
			defaultValues: initialValues,
		});

	// Watch all form fields
	const formValues = watch();

	// Check if form has changed
	const [hasChanged, setHasChanged] = useState(false);

	const defaultRequireApproval = watch('defaultRequireApproval');
	const selectedDefaultSequenceType = watch('defaultSequenceType');

	useEffect(() => {
		const isChanged =
			formValues.defaultRequireApproval !==
				initialValues.defaultRequireApproval ||
			formValues.defaultSequenceDuration !==
				initialValues.defaultSequenceDuration ||
			formValues.defaultReferencePrevious !==
				initialValues.defaultReferencePrevious ||
			formValues.defaultAlterSubjectLine !==
				initialValues.defaultAlterSubjectLine ||
			formValues.defaultSendDelay !== initialValues.defaultSendDelay ||
			Number(formValues.defaultSequenceType) !==
				Number(initialValues.defaultSequenceType);

		setHasChanged(isChanged);
	}, [formValues, initialValues]);

	const onSubmit: SubmitHandler<SequenceDefaultsFormData> = async (data) => {
		// convert defaultSequenceDuration, defaultSendDelay and defaultSequenceType to number before sending to API
		const payload = {
			...data,
			defaultSequenceDuration: Number(data.defaultSequenceDuration),
			defaultSendDelay: Number(data.defaultSendDelay),
			defaultSequenceType: Number(data.defaultSequenceType),
		};

		try {
			setLoading(true);
			setLoadingMessage('Saving');
			await updateUser({ ...payload });

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

	const withAutoSendDeadlineOptions = [
		{ label: '1 day', value: 1 },
		{ label: '2 days', value: 2 },
		{ label: 'Never auto-send', value: 999 },
	];

	const withoutAutoSendDeadlineOptions = [
		{ label: 'No approval needed', value: 0 },
	];

	const approvalDeadlineOptions =
		defaultRequireApproval ?
			withAutoSendDeadlineOptions
		:	withoutAutoSendDeadlineOptions;

	const sequenceDurationOptions = [
		{ label: '15 days', value: 15 },
		{ label: '30 days', value: 30 },
		{ label: '60 days', value: 60 },
		{ label: '90 days', value: 90 },
		{ label: 'Indefinitely', value: -1 },
	];

	const defaultSequenceTypeOptions = [
		{
			label: '3-day Sequence',
			description: 'Wait 3 days → Repeat',
			value: 3,
		},
		{
			label: '3-1 Sequence',
			description: 'Wait 3 days → Wait 1 day → Repeat',
			value: 31,
		},
		{
			label: 'Weekly Follow-up',
			description: 'Wait 7 days → Repeat',
			value: 7,
		},
		{
			label: 'Bi-weekly Follow-up',
			description: 'Wait 14 days → Repeat',
			value: 14,
		},
		{
			label: 'Monthly Follow-up',
			description: 'Wait 28 days → Repeat',
			value: 28,
		},
	];

	const systemDefaults = {
		defaultRequireApproval: true,
		defaultSequenceDuration: 60,
		defaultReferencePrevious: true,
		defaultAlterSubjectLine: false,
		defaultSendDelay: 0,
		defaultSequenceType: 3,
	};

	return (
		<div className={styles['settings-form-wrapper']}>
			<form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
				<h3 className={styles['section-title']}>Automation</h3>
				<section className={styles.section}>
					<div
						className={`${styles['input-group']} ${styles['checkbox-group']}`}
					>
						<input
							type='checkbox'
							id='defaultRequireApproval'
							{...register('defaultRequireApproval')}
						/>
						<div className={styles.input}>
							<label htmlFor='defaultRequireApproval'>
								<span>Require approval for auto-generated messages</span>
							</label>
							<small>
								Messages will need manual approval before sending (recommended)
							</small>
						</div>
					</div>

					<div className={styles['input-group']}>
						<label htmlFor='defaultSequenceDuration'>
							Sequence duration (days)
						</label>
						<div className={styles.input}>
							<select
								id='defaultSequenceDuration'
								{...register('defaultSequenceDuration')}
							>
								{sequenceDurationOptions.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
							<small className={styles.helpText}>
								Maximum duration for a sequence before automatic termination
							</small>
						</div>
					</div>
				</section>

				<h3 className={styles['section-title']}>Message Generation</h3>
				<section className={styles.section}>
					<div
						className={`${styles['input-group']} ${styles['checkbox-group']}`}
					>
						<input
							type='checkbox'
							id='defaultReferencePrevious'
							{...register('defaultReferencePrevious')}
						/>
						<div className={styles.input}>
							<label htmlFor='defaultReferencePrevious'>
								<span>Reference previous emails in follow-ups</span>
							</label>
							<small>
								AI will use context from previous messages when generating
								follow-ups
							</small>
						</div>
					</div>

					<div
						className={`${styles['input-group']} ${styles['checkbox-group']}`}
					>
						<input
							type='checkbox'
							id='defaultAlterSubjectLine'
							{...register('defaultAlterSubjectLine')}
						/>
						<div className={styles.input}>
							<label htmlFor='defaultAlterSubjectLine'>
								<span>Allow AI to alter subject lines</span>
							</label>
							<small>
								AI can modify subject lines for follow-ups (e.g., add "Re:" or
								"Follow-up:")
							</small>
						</div>
					</div>
				</section>

				<h3 className={styles['section-title']}>Approval Workflow</h3>
				<section className={styles.section}>
					<div className={styles['input-group']}>
						<label htmlFor='approvalDeadline'>Approval deadline (days)</label>
						<div className={styles.input}>
							<select
								id='defaultSendDelay'
								{...register('defaultSendDelay')}
								disabled={!defaultRequireApproval}
							>
								{approvalDeadlineOptions.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
							<small className={styles.helpText}>
								Number of days to wait before automatically sending messages
								without approval.{' '}
								<span className={styles.important}>
									Setting to "Never auto-send" will prevent automatic sending
									and require manual approval for all messages.
								</span>
							</small>
						</div>
					</div>
				</section>

				<div className={styles['section-title-wrapper']}>
					<h3 className={styles['section-title']}>
						{/* Follow-up Schedule */}
						Sequence Type
					</h3>
					<p className={styles['section-description']}>
						{/* Predefined schedules for following up with your contacts. */}
						Predefined sequence structures for common use cases.
					</p>
				</div>
				<section className={styles.section}>
					<div className={styles['tile-grid']}>
						{defaultSequenceTypeOptions.map((option, index) => (
							<div
								key={index}
								className={`${styles['tile-group']} ${Number(selectedDefaultSequenceType) === option.value ? styles.selected : ''}`}
							>
								<label htmlFor={`defaultSequenceType-${option.value}`}>
									<span>{option.label}</span>
									<small>{option.description}</small>
									<input
										type='radio'
										id={`defaultSequenceType-${option.value}`}
										value={option.value}
										{...register('defaultSequenceType')}
									/>
								</label>
							</div>
						))}
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

export default SequenceDefaultsForm;
