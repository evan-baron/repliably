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
			name: 'Sample Signature Title 1',
			isDefault: true,
			content: 'Best regards,\n\nJohn Doe',
		},
		{
			id: 2,
			name: 'Sample Signature Title 2',
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
					Manage your email signatures.{' '}
					<span className={styles.important}>
						Default signature will be automatically appended to outbound
						messages.
					</span>
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
									{!signature.isDefault ?
										<button
											className={`${styles['mini-button']} ${styles['default-button']}`}
										>
											Set Default
										</button>
									:	<button
											className={`${styles['mini-button']} ${styles['default-button']}`}
										>
											Remove Default
										</button>
									}
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
