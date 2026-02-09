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
	const { isSaving, setIsSaving, setActiveTab } = useSettingsContext();

	interface SequenceDefaultsFormData {
		autoSend: boolean;
		sequenceDuration: number;
		referencePreviousEmail: boolean;
		alterSubjectLine: boolean;
		autoSendDelay: number;
		sequenceType: number;
	}

	const { register, watch, handleSubmit, reset, setValue } =
		useForm<SequenceDefaultsFormData>({
			defaultValues: {
				autoSend: false,
				sequenceDuration: 60,
				referencePreviousEmail: true,
				alterSubjectLine: false,
				autoSendDelay: 0,
				sequenceType: 3,
			},
		});

	const autoSendEnabled = watch('autoSend');
	const selectedSequenceType = watch('sequenceType');

	const withAutoSendDeadlineOptions = [
		{ label: '1 day', value: 1 },
		{ label: '2 days', value: 2 },
		{ label: 'Never auto-send', value: 999 },
	];

	const withoutAutoSendDeadlineOptions = [
		{ label: 'No approval needed', value: 0 },
	];

	const approvalDeadlineOptions =
		autoSendEnabled ?
			withAutoSendDeadlineOptions
		:	withoutAutoSendDeadlineOptions;

	const sequenceDurationOptions = [
		{ label: '15 days', value: 15 },
		{ label: '30 days', value: 30 },
		{ label: '60 days', value: 60 },
		{ label: '90 days', value: 90 },
		{ label: 'Indefinitely', value: 0 },
	];

	const sequenceTypeOptions = [
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
		autoSend: true,
		sequenceDuration: 60,
		referencePreviousEmail: true,
		alterSubjectLine: false,
		autoSendDelay: 0,
		sequenceType: 3,
	};

	return (
		<div className={styles['settings-form-wrapper']}>
			<form className={styles.form}>
				<h3 className={styles['section-title']}>Automation</h3>
				<section className={styles.section}>
					<div
						className={`${styles['input-group']} ${styles['checkbox-group']}`}
					>
						<input type='checkbox' id='autoSend' {...register('autoSend')} />
						<div className={styles.input}>
							<label htmlFor='autoSend'>
								<span>Require approval for auto-generated messages</span>
							</label>
							<small>
								Messages will need manual approval before sending (recommended)
							</small>
						</div>
					</div>

					<div className={styles['input-group']}>
						<label htmlFor='sequenceDuration'>Sequence duration (days)</label>
						<div className={styles.input}>
							<select id='sequenceDuration' {...register('sequenceDuration')}>
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
							id='referencePreviousEmail'
							{...register('referencePreviousEmail')}
						/>
						<div className={styles.input}>
							<label htmlFor='referencePreviousEmail'>
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
							id='alterSubjectLine'
							{...register('alterSubjectLine')}
						/>
						<div className={styles.input}>
							<label htmlFor='alterSubjectLine'>
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
						<label htmlFor='autoSendDelay'>Approval deadline (days)</label>
						<div className={styles.input}>
							<select
								id='autoSendDelay'
								{...register('autoSendDelay')}
								disabled={!autoSendEnabled}
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
									Setting to "Never Auto-send" will prevent automatic sending
									and require manual approval for all messages.
								</span>
							</small>
						</div>
					</div>
				</section>

				<div className={styles['section-title-wrapper']}>
					<h3 className={styles['section-title']}>Sequence Type</h3>
					<p className={styles['section-description']}>
						Predefined sequence structures for common use cases.
					</p>
				</div>
				<section className={styles.section}>
					<div className={styles['tile-grid']}>
						{sequenceTypeOptions.map((option, index) => (
							<div
								key={index}
								className={`${styles['tile-group']} ${Number(selectedSequenceType) === option.value ? styles.selected : ''}`}
							>
								<label htmlFor={`sequenceType-${option.value}`}>
									<span>{option.label}</span>
									<small>{option.description}</small>
								</label>
								<input
									type='radio'
									id={`sequenceType-${option.value}`}
									value={option.value}
									{...register('sequenceType')}
								/>
							</div>
						))}
					</div>
				</section>

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

export default SequenceDefaultsForm;
