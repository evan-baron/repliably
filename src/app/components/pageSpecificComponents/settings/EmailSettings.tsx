'use client';

// Library imports
import { useState } from 'react';

// Styles imports
import styles from './EmailSettings.module.scss';

const EmailSettings = () => {
	const [signatures, setSignatures] = useState([
		{
			id: 1,
			name: 'Professional',
			isDefault: true,
			content: 'Best regards,\nJohn Doe',
		},
		{ id: 2, name: 'Casual', isDefault: false, content: 'Thanks,\nJohn' },
	]);

	const [templates, setTemplates] = useState([
		{
			id: 1,
			name: 'Initial Outreach',
			category: 'initial',
			usageCount: 45,
			isActive: true,
		},
		{
			id: 2,
			name: 'Follow-up #1',
			category: 'follow-up',
			usageCount: 32,
			isActive: true,
		},
		{
			id: 3,
			name: 'Thank You',
			category: 'thank-you',
			usageCount: 18,
			isActive: true,
		},
	]);

	return (
		<div className={styles.emailSettings}>
			<section className={styles.section}>
				<h2 className={styles.sectionTitle}>Email Signatures</h2>
				<p className={styles.sectionDescription}>
					Manage your email signatures. Default signature will be automatically
					appended to outbound messages.
				</p>

				<div className={styles.signatureList}>
					{signatures.map((signature) => (
						<div key={signature.id} className={styles.signatureItem}>
							<div className={styles.signatureInfo}>
								<h3>{signature.name}</h3>
								{signature.isDefault && (
									<span className={styles.defaultBadge}>Default</span>
								)}
								<pre className={styles.signaturePreview}>
									{signature.content}
								</pre>
							</div>
							<div className={styles.signatureActions}>
								<button className={styles.iconButton}>Edit</button>
								{!signature.isDefault && (
									<button className={styles.iconButton}>Set Default</button>
								)}
								<button className={styles.iconButton}>Delete</button>
							</div>
						</div>
					))}
				</div>

				<button className={styles.primaryButton}>
					<span>+</span> Add New Signature
				</button>
			</section>

			<section className={styles.section}>
				<h2 className={styles.sectionTitle}>Email Templates</h2>
				<p className={styles.sectionDescription}>
					Create and manage reusable email templates with placeholders for
					contact information.
				</p>

				<div className={styles.templateList}>
					<div className={styles.templateHeader}>
						<span>Template Name</span>
						<span>Category</span>
						<span>Usage</span>
						<span>Status</span>
						<span>Actions</span>
					</div>

					{templates.map((template) => (
						<div key={template.id} className={styles.templateItem}>
							<span className={styles.templateName}>{template.name}</span>
							<span className={styles.category}>{template.category}</span>
							<span className={styles.usage}>{template.usageCount} times</span>
							<span
								className={`${styles.status} ${
									template.isActive ? styles.active : styles.inactive
								}`}
							>
								{template.isActive ? 'Active' : 'Inactive'}
							</span>
							<div className={styles.templateActions}>
								<button className={styles.iconButton}>Edit</button>
								<button className={styles.iconButton}>Duplicate</button>
								<button className={styles.iconButton}>Delete</button>
							</div>
						</div>
					))}
				</div>

				<button className={styles.primaryButton}>
					<span>+</span> Create Template
				</button>
			</section>

			<section className={styles.section}>
				<h2 className={styles.sectionTitle}>Gmail Integration</h2>
				<div className={styles.integrationStatus}>
					<div className={styles.statusCard}>
						<div>
							<h3>Connection Status</h3>
							<p>
								<span className={styles.statusDot} /> Connected to Gmail
							</p>
							<small>Last synced: 2 hours ago</small>
						</div>
						<button className={styles.secondaryButton}>Reconnect</button>
					</div>

					<div className={styles.statusCard}>
						<div>
							<h3>OAuth Permissions</h3>
							<p>Full Gmail access granted</p>
							<small>Send, read, and manage emails</small>
						</div>
						<button className={styles.secondaryButton}>
							Review Permissions
						</button>
					</div>
				</div>
			</section>

			<section className={styles.section}>
				<h2 className={styles.sectionTitle}>Sending Preferences</h2>
				<form className={styles.preferencesForm}>
					<div className={styles.formGroup}>
						<label>
							<input type='checkbox' defaultChecked />
							<span>Track email opens</span>
						</label>
						<small>Add tracking pixel to outbound emails</small>
					</div>

					<div className={styles.formGroup}>
						<label>
							<input type='checkbox' defaultChecked />
							<span>Track link clicks</span>
						</label>
						<small>Monitor when recipients click links in your emails</small>
					</div>

					<div className={styles.formGroup}>
						<label>
							<input type='checkbox' />
							<span>Automatically mark contacts as invalid on hard bounce</span>
						</label>
						<small>Prevents future emails to bounced addresses</small>
					</div>

					<div className={styles.formGroup}>
						<label htmlFor='dailyLimit'>Daily send limit</label>
						<input
							type='number'
							id='dailyLimit'
							min='0'
							max='500'
							defaultValue='100'
							placeholder='100'
						/>
						<small>Maximum emails to send per day (Gmail limit: 500)</small>
					</div>

					<button type='submit' className={styles.primaryButton}>
						Save Preferences
					</button>
				</form>
			</section>
		</div>
	);
};

export default EmailSettings;
