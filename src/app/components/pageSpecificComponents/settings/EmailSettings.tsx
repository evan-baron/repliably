'use client';

// Library imports
import { useState } from 'react';

// Helpers imports
import { parseReplyContent } from '@/lib/helpers/emailHelpers';

// Styles imports
import styles from './settings.module.scss';

// Types imports
import { UserToClientFromDB } from '@/types/userTypes';

// Components imports
import SendingPreferencesForm from '../../forms/emailSettings/SendingPreferencesForm';

const EmailSettings = ({ user }: { user: UserToClientFromDB }) => {
	const [signatures, setSignatures] = useState([
		{
			id: 1,
			name: 'Signature 1',
			isDefault: true,
			content: 'Best regards,\n\nJohn Doe',
		},
		{
			id: 2,
			name: 'Signature 2',
			isDefault: false,
			content: 'Thanks,\n\nJohn',
		},
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
		<div className={styles['settings-container']}>
			<section className={styles.section}>
				<h3 className={styles['section-title']}>Email Signatures</h3>
				<p className={styles['section-description']}>
					Manage your email signatures. Default signature will be automatically
					appended to outbound messages.
				</p>

				<div className={styles.signatureList}>
					{signatures.map((signature) => {
						const parsedSignature = parseReplyContent(signature.content);

						return (
							<div key={signature.id} className={styles.signatureItem}>
								<div className={styles.signatureInfo}>
									<div className={styles.name}>
										{signature.isDefault && signatures.length > 1 && (
											<span className={styles.default}>Default</span>
										)}
										<h4>{signature.name}</h4>
									</div>

									<pre className={styles.preview}>
										{parsedSignature.map((line, index) => (
											<span key={index}>{line}</span>
										))}
									</pre>
								</div>
								<div className={styles.signatureActions}>
									<button className={styles['mini-button']}>Edit</button>
									{!signature.isDefault && (
										<button className={styles['mini-button']}>
											Set Default
										</button>
									)}
									<button className={styles['mini-button']}>Delete</button>
								</div>
							</div>
						);
					})}
				</div>

				<button className={'button settings-button'}>Add New Signature</button>
			</section>

			<section className={styles.section}>
				<h3 className={styles['section-title']}>Email Templates</h3>
				<p className={styles['section-description']}>Coming soon!</p>
				{/* <p className={styles['section-description']}>
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

				<button className={'button settings-button'}>Create Template</button> */}
			</section>

			<section className={styles.section}>
				<h3 className={styles['section-title']}>Gmail Integration</h3>
				<div className={styles.options}>
					<div className={styles.item}>
						<div className={styles.info}>
							<h4>Connection Status</h4>
							<p>
								<span className={`${styles['status-dot']} ${styles.active}`} />
								Connected to Gmail
							</p>
							<small>Last synced: 2 hours ago</small>
						</div>
						<button className={'button settings-button'}>Reconnect</button>
					</div>
					{/* 
					<div className={styles.item}>
						<div>
							<h4>OAuth Permissions</h4>
							<p>Full Gmail access granted</p>
							<small>Send, read, and manage emails</small>
						</div>
						<button className={styles.secondaryButton}>
							Review Permissions
						</button>
					</div> */}
				</div>
			</section>

			<section className={styles.section}>
				<h3 className={styles['section-title']}>Sending Preferences</h3>
				<SendingPreferencesForm user={user} />
			</section>
		</div>
	);
};

export default EmailSettings;
