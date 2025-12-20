'use client';

// Library imports
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

// Hooks imports

// Styles imports
import styles from './newEmailForm.module.scss';

// Component imports
import TinyEditor from '../../editor/TinyEditor';
import TestButton from '../../testComponents/TestButton';

interface EmailFormData {
	to: string;
	subject: string;
	followUpCadence: string;
	reviewBeforeSending: boolean;
	sendWithoutReviewAfter: string;
}

const NewEmailForm = () => {
	const [editorContent, setEditorContent] = useState<string>('');
	const [sending, setSending] = useState<boolean>(false);
	const [message, setMessage] = useState('');

	const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<EmailFormData>({
		defaultValues: {
			to: '',
			subject: '',
			followUpCadence: '',
			reviewBeforeSending: false,
			sendWithoutReviewAfter: '',
		},
	});

	const onSubmit: SubmitHandler<EmailFormData> = async (data) => {
		setSending(true);

		try {
			const response = await fetch('/api/send-email', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					to: data.to,
					subject: data.subject || 'Email from Application',
					body:
						editorContent ||
						'This is an email from the application automation system.',
				}),
			});

			const result = await response.json();

			if (response.ok) {
				alert('Email sent successfully!');
				setMessage('');
				setEditorContent('');
				reset(); // Reset form fields
			} else {
				alert(`Failed to send email: ${result.error || 'Unknown error'}`);
			}
		} catch (error) {
			console.error('Error sending email:', error);
			alert('Error sending email. Check console for details.');
		} finally {
			setSending(false);
		}
	};

	return (
		<div className={styles['newemailform-wrapper']}>
			<form onSubmit={handleSubmit(onSubmit)}>
				<section className={styles['form-settings']}>
					<h2>Follow-up Settings</h2>
					{/* Follow-up Cadence */}
					<div>
						<label htmlFor='followUpCadence'>Follow-up Cadence:</label>
						<select
							id='followUpCadence'
							// {...register('followUpCadence', {
							// 	required: 'Please select a follow-up cadence',
							// })}
						>
							<option value=''>Select cadence...</option>
							<option value='2day'>Every 2 days</option>
							<option value='3day'>Every 3 days</option>
							<option value='32day'>Wait 3 then Wait 2 Repeat</option>
							<option value='weekly'>Weekly on {today}</option>
							<option value='biweekly'>Bi-weekly on {today}</option>
						</select>
						{errors.followUpCadence && (
							<span>{errors.followUpCadence.message}</span>
						)}
					</div>
					{/* Review Before Sending */}
					<div>
						<label htmlFor='reviewBeforeSending'>
							Review Before Sending:
							<input
								type='checkbox'
								id='reviewBeforeSending'
								{...register('reviewBeforeSending')}
							/>
						</label>
					</div>
					{/* Send without Review after */}
					<div>
						<label htmlFor='sendWithoutReviewAfter'>
							Send without Review after:
						</label>
						<select
							id='sendWithoutReviewAfter'
							{...register('sendWithoutReviewAfter')}
						>
							<option value=''>Select time...</option>
							<option value='1day'>1 Day</option>
							<option value='2days'>2 Days</option>
							<option value='never'>Never</option>
						</select>
					</div>
				</section>

				<section className={styles['form-email']}>
					{/* To Field */}
					<div>
						<label htmlFor='to'>To:</label>
						<input
							type='email'
							id='to'
							{...register('to', {
								required: 'Email address is required',
								pattern: {
									value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
									message: 'Invalid email address',
								},
							})}
						/>
						{errors.to && <span>{errors.to.message}</span>}
					</div>

					{/* Subject Field */}
					<div>
						<label htmlFor='subject'>Subject:</label>
						<input
							type='text'
							id='subject'
							{...register('subject', { required: 'Subject is required' })}
						/>
						{errors.subject && <span>{errors.subject.message}</span>}
					</div>

					{/* Email Body - RTE */}
					<div className={styles['rte-wrapper']}>
						<TinyEditor setEditorContent={setEditorContent} />
					</div>

					{/* Send Buttons */}
					<button type='submit' disabled={sending}>
						{sending ? 'Sending...' : 'Send Test Email'}
					</button>
				</section>
			</form>
		</div>
	);
};

export default NewEmailForm;
