'use client';

// Library imports
import { useState } from 'react';

// Helpers imports
import { parseEmailContent } from '@/lib/helpers/emailHelpers';

// Hooks imports
import {
	useDeleteSignature,
	useSaveSignature,
} from '@/hooks/useUserSignatures';

// Styles imports
import styles from './settings.module.scss';

// Types imports
import { UserToClientFromDB } from '@/types/userTypes';

// Components imports
import SendingPreferencesForm from '../../forms/emailSettings/SendingPreferencesForm';
import TinyEditor from '../../editor/TinyEditor';

const EmailSettings = ({ user }: { user: UserToClientFromDB }) => {
	const { mutateAsync: saveSignature } = useSaveSignature();
	const { mutateAsync: deleteSignature } = useDeleteSignature();
	const [addingNewSignature, setAddingNewSignature] = useState(false);
	const [editorContent, setEditorContent] = useState<string>('');
	const [signatureName, setSignatureName] = useState<string>('');

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

	const handleAddSignature = () => {
		setAddingNewSignature(true);
	};

	const handleCancel = () => {
		setAddingNewSignature(false);
		setEditorContent('');
		setSignatureName('');
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSignatureName(e.target.value);
	};

	const handleSaveSignature = async () => {
		if (editorContent.trim() === '') {
			setAddingNewSignature(false);
			setSignatureName('');
			return;
		}

		const emailSignature = {
			name: signatureName || `Signature ${user.signatures.length + 1}`,
			isDefault: user.signatures.length === 0,
			content: editorContent,
		};

		try {
			await saveSignature({ emailSignature });
			setAddingNewSignature(false);
			setEditorContent('');
			setSignatureName('');
		} catch (error) {
			// Handle error (e.g., show notification)
			console.error('Error saving signature:', error);
		}
	};

	const handleDeleteSignature = async (signatureId: number) => {
		console.log('Deleting signature with ID:', signatureId);
		try {
			await deleteSignature(signatureId);
		} catch (error) {
			// Handle error (e.g., show notification)
			console.error('Error deleting signature:', error);
		}
	};

	const handleSetDefault = (signatureId: number) => {
		// Implement set default functionality
	};

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

				{/* {user.signatures.length === 0 && (
					<div className={styles.description}>
						<p>Compose New Signature</p>
						<small>
							Only simple text signatures are supported.{' '}
							<span className={styles.important}>
								Custom formatting and images are not supported at this time.
							</span>
						</small>
					</div>
				)} */}
				{addingNewSignature && (
					<div className={styles['new-signature']}>
						<div className={styles.description}>
							<p>Compose New Signature</p>
							<small>
								Only simple text signatures are supported.{' '}
								<span className={styles.important}>
									Custom formatting and images are not supported at this time.
								</span>
							</small>
						</div>
						<div className={styles['editor-wrapper']}>
							<div className={styles['input-group']}>
								<label htmlFor='signatureName'>Signature Name:</label>
								<input
									type='text'
									id='signatureName'
									placeholder='Enter signature name...'
									className={styles['signature-name-input']}
									value={signatureName}
									onChange={handleChange}
									maxLength={50}
								/>
							</div>
							<TinyEditor
								height={200}
								width={800}
								placeholder='Compose your new signature here...'
								maxLength={500}
								setEditorContent={setEditorContent}
							/>
						</div>
						<div className={styles['new-signature-actions']}>
							<button
								className={'button signature-save'}
								onClick={handleSaveSignature}
							>
								Save Signature
							</button>
							<button
								className={'button settings-button'}
								onClick={handleCancel}
							>
								Cancel
							</button>
						</div>
					</div>
				)}
				{user.signatures.length > 0 && (
					<div className={styles['signature-list']}>
						{user.signatures.map((signature) => {
							const parsedSignature = parseEmailContent(signature.content);

							console.log('signature:', signature);

							return (
								<div key={signature.id} className={styles['signature-item']}>
									<div className={styles['signature-info']}>
										<div className={styles.name}>
											{signature.isDefault && user.signatures.length > 1 && (
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
									<div className={styles['signature-actions']}>
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
										<button
											className={styles['mini-button']}
											onClick={() => handleDeleteSignature(signature.id)}
										>
											Delete
										</button>
									</div>
								</div>
							);
						})}
					</div>
				)}

				{!addingNewSignature && (
					<button
						className={'button settings-button'}
						onClick={handleAddSignature}
					>
						Add New Signature
					</button>
				)}
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
