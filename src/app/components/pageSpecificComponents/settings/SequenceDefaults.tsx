'use client';

// Library imports
import { useState } from 'react';

// Styles imports
import styles from './SequenceDefaults.module.scss';

const SequenceDefaults = () => {
	const [formData, setFormData] = useState({
		autoSend: false,
		autoSendDelay: 3,
		sequenceDuration: 30,
		referencePreviousEmail: true,
		alterSubjectLine: false,
		needsApproval: true,
		approvalDeadlineHours: 24,
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// TODO: Implement save functionality
		console.log('Saving sequence defaults:', formData);
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value, type } = e.target;
		const checked = (e.target as HTMLInputElement).checked;

		setFormData((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));
	};

	return (
		<div className={styles.sequenceDefaults}>
			<section className={styles.section}>
				<h2 className={styles.sectionTitle}>Default Sequence Settings</h2>
				<p className={styles.sectionDescription}>
					Configure default settings for new sequences. These can be overridden
					when creating individual sequences.
				</p>

				<form onSubmit={handleSubmit} className={styles.form}>
					<div className={styles.formSection}>
						<h3 className={styles.subsectionTitle}>Automation</h3>

						<div className={styles.formGroup}>
							<label>
								<input
									type='checkbox'
									name='autoSend'
									checked={formData.autoSend}
									onChange={handleChange}
								/>
								<span>Enable auto-send by default</span>
							</label>
							<small>
								Automatically send scheduled messages without manual approval
							</small>
						</div>

						<div className={styles.formGroup}>
							<label htmlFor='autoSendDelay'>Auto-send delay (days)</label>
							<input
								type='number'
								id='autoSendDelay'
								name='autoSendDelay'
								min='1'
								max='30'
								value={formData.autoSendDelay}
								onChange={handleChange}
								disabled={!formData.autoSend}
							/>
							<small>
								Number of days to wait before sending follow-up messages
							</small>
						</div>

						<div className={styles.formGroup}>
							<label htmlFor='sequenceDuration'>Sequence duration (days)</label>
							<input
								type='number'
								id='sequenceDuration'
								name='sequenceDuration'
								min='7'
								max='90'
								value={formData.sequenceDuration}
								onChange={handleChange}
							/>
							<small>
								Maximum duration for a sequence before automatic termination
							</small>
						</div>
					</div>

					<div className={styles.formSection}>
						<h3 className={styles.subsectionTitle}>Message Generation</h3>

						<div className={styles.formGroup}>
							<label>
								<input
									type='checkbox'
									name='referencePreviousEmail'
									checked={formData.referencePreviousEmail}
									onChange={handleChange}
								/>
								<span>Reference previous emails in follow-ups</span>
							</label>
							<small>
								AI will use context from previous messages when generating
								follow-ups
							</small>
						</div>

						<div className={styles.formGroup}>
							<label>
								<input
									type='checkbox'
									name='alterSubjectLine'
									checked={formData.alterSubjectLine}
									onChange={handleChange}
								/>
								<span>Allow AI to alter subject lines</span>
							</label>
							<small>
								AI can modify subject lines for follow-ups (e.g., add "Re:" or
								"Follow-up:")
							</small>
						</div>
					</div>

					<div className={styles.formSection}>
						<h3 className={styles.subsectionTitle}>Approval Workflow</h3>

						<div className={styles.formGroup}>
							<label>
								<input
									type='checkbox'
									name='needsApproval'
									checked={formData.needsApproval}
									onChange={handleChange}
								/>
								<span>Require approval for generated messages</span>
							</label>
							<small>
								Messages will need manual approval before sending (recommended)
							</small>
						</div>

						<div className={styles.formGroup}>
							<label htmlFor='approvalDeadlineHours'>
								Approval deadline (hours)
							</label>
							<input
								type='number'
								id='approvalDeadlineHours'
								name='approvalDeadlineHours'
								min='1'
								max='168'
								value={formData.approvalDeadlineHours}
								onChange={handleChange}
								disabled={!formData.needsApproval}
							/>
							<small>
								Hours before scheduled send time to require approval decision
							</small>
						</div>
					</div>

					<div className={styles.formActions}>
						<button type='submit' className={styles.primaryButton}>
							Save Defaults
						</button>
						<button type='button' className={styles.secondaryButton}>
							Reset to System Defaults
						</button>
					</div>
				</form>
			</section>

			<section className={styles.section}>
				<h2 className={styles.sectionTitle}>Sequence Templates</h2>
				<p className={styles.sectionDescription}>
					Predefined sequence structures for common use cases
				</p>

				<div className={styles.templateGrid}>
					<div className={styles.templateCard}>
						<h3>3-2-1 Sequence</h3>
						<p>Wait 3 days → Wait 2 days → Wait 1 day</p>
						<span className={styles.templateBadge}>Most Popular</span>
						<button className={styles.iconButton}>Configure</button>
					</div>

					<div className={styles.templateCard}>
						<h3>Weekly Follow-up</h3>
						<p>Wait 7 days → Wait 7 days → Wait 7 days</p>
						<span className={styles.templateBadge}>Professional</span>
						<button className={styles.iconButton}>Configure</button>
					</div>

					<div className={styles.templateCard}>
						<h3>Quick Follow-up</h3>
						<p>Wait 1 day → Wait 2 days → Wait 3 days</p>
						<span className={styles.templateBadge}>Aggressive</span>
						<button className={styles.iconButton}>Configure</button>
					</div>

					<div className={styles.templateCard}>
						<h3>Custom Sequence</h3>
						<p>Define your own timing and steps</p>
						<button className={styles.iconButton}>Create Custom</button>
					</div>
				</div>
			</section>
		</div>
	);
};

export default SequenceDefaults;
