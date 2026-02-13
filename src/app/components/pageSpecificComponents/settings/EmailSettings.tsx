'use client';

// Library imports
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Helpers imports
import {
	parseEmailContent,
	parseTinyMceContent,
} from '@/lib/helpers/emailHelpers';

// Hooks imports
import {
	useDeleteSignature,
	useSaveSignature,
	useUpdateSignature,
} from '@/hooks/useUserSignatures';
import { useDisconnectEmail } from '@/hooks/useDisconnectEmail';
import {
	useSetupGmailNotifications,
	useStopGmailNotifications,
} from '@/hooks/useUserSettings';

// Styles imports
import styles from './settings.module.scss';

// Types imports
import { UserToClientFromDB } from '@/types/userTypes';

// Components imports
import SendingPreferencesForm from '../../forms/emailSettings/SendingPreferencesForm';
import SignatureItem from './signatures/SignatureItem';
import SignatureEditor from './signatures/SignatureEditor';

// Context imports
import { useAppContext } from '@/app/context/AppContext';

const EmailSettings = ({
	user,
	emailStatus,
	errorStatus,
}: {
	user: UserToClientFromDB;
	emailStatus?: string;
	errorStatus?: string;
}) => {
	const { mutateAsync: saveSignature } = useSaveSignature();
	const { mutateAsync: deleteSignature } = useDeleteSignature();
	const { mutateAsync: updateSignature } = useUpdateSignature();
	const { mutateAsync: disconnectEmail, isPending: isDisconnecting } =
		useDisconnectEmail();
	const { mutateAsync: setupGmailNotifications } = useSetupGmailNotifications();
	const { mutateAsync: stopGmailNotifications } = useStopGmailNotifications();
	const { setModalType, setErrors, setAlertMessage } = useAppContext();
	const [addingNewSignature, setAddingNewSignature] = useState(false);
	const [editorContent, setEditorContent] = useState<string>('');
	const [signatureName, setSignatureName] = useState<string>('');
	const [editing, setEditing] = useState<number | null>(null);
	const [isConnecting, setIsConnecting] = useState<boolean>(false);
	const [watchAllowed, setWatchAllowed] = useState<boolean>(
		user.gmailWatchAllowed,
	);
	const router = useRouter();

	useEffect(() => {
		if (emailStatus === 'connected') {
			setModalType('alert');
			setAlertMessage('Email connected successfully!');

			// Connect to gmail watcher immediately to start receiving notifications (instead of waiting for next sync)
			setupGmailNotifications();
		} else if (errorStatus) {
			let errorMessage = 'An error occurred while connecting email.';
			if (errorStatus === 'access_denied') {
				errorMessage = 'You denied access to your email account.';
			} else if (errorStatus === 'no_code') {
				errorMessage = 'No authorization code received from email.';
			} else if (errorStatus === 'not_authenticated') {
				errorMessage = 'You must be logged in to connect your email account.';
			} else if (errorStatus === 'no_refresh_token') {
				errorMessage =
					'No refresh token received. This may happen if you have previously connected your email account. Please try disconnecting and reconnecting your account.';
			}
			setModalType('error');
			setErrors([errorMessage]);
			router.replace('/dashboard/settings?tab=email');
		}
	}, [emailStatus, errorStatus, setModalType, setErrors, router]);

	const handleAddSignature = () => {
		setAddingNewSignature(true);
	};

	const handleCancel = () => {
		setAddingNewSignature(false);
		setEditorContent('');
		setSignatureName('');

		editing !== null && setEditing(null);
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

	const handleSaveChanges = async (signatureId: number) => {
		if (editing === null) return;

		const originalName =
			user.signatures.find((sig) => sig.id === signatureId)?.name || '';

		const originalContent =
			user.signatures.find((sig) => sig.id === signatureId)?.content || '';

		const emailSignature = {
			name: signatureName.trim() === '' ? originalName : signatureName.trim(),
			content:
				editorContent.trim() === '' ? originalContent : editorContent.trim(),
		};

		try {
			await updateSignature({ signatureId, emailSignature });
			setEditing(null);
			setSignatureName('');
			setEditorContent('');
		} catch (error) {
			// Handle error (e.g., show notification)
			console.error('Error updating signature:', error);
		}
	};

	const handleEdit = (id: number) => {
		const signature = user.signatures.find((sig) => sig.id === id);

		if (!signature) return;

		setEditing(signature.id);
		setSignatureName(signature.name);
		setEditorContent(signature.content);
	};

	const handleChangeDefault = async (
		signatureId: number,
		isDefault: boolean,
	) => {
		try {
			await updateSignature({ signatureId, emailSignature: { isDefault } });
		} catch (error) {
			console.error('Error updating default signature:', error);
		}
	};

	const handleDeleteSignature = async (signatureId: number) => {
		try {
			await deleteSignature(signatureId);
		} catch (error) {
			// Handle error (e.g., show notification)
			console.error('Error deleting signature:', error);
		}
	};

	const handleConnectEmail = () => {
		setIsConnecting(true);
		window.location.href = '/api/auth/google/initiate';
	};

	const handleDisconnectEmail = async () => {
		try {
			await disconnectEmail();
			setModalType('alert');
			setAlertMessage('Email account disconnected successfully!');
		} catch (error) {
			setModalType('error');
			setErrors(['Failed to disconnect from Email']);
		}
	};

	const handleStartWatching = async () => {
		const result = await setupGmailNotifications();
		const { success } = result;

		if (success) {
			setWatchAllowed(true);
			setModalType('alert');
			setAlertMessage('Gmail watch notifications setup successfully!');
		} else {
			setModalType('error');
			setErrors(['Failed to setup Gmail watch notifications']);
		}
	};

	const handleStopWatching = async () => {
		const result = await stopGmailNotifications();
		const { success } = result;

		if (success) {
			setWatchAllowed(false);
			setModalType('alert');
			setAlertMessage('Gmail watch notifications stopped successfully!');
		} else {
			setModalType('error');
			setErrors(['Failed to stop Gmail watch notifications']);
		}
	};

	return (
		<div className={styles['settings-container']}>
			<section className={styles.section} aria-labelledby='signatures-title'>
				<h3 id='signatures-title' className={styles['section-title']}>
					Email Signatures
				</h3>
				<p className={styles['section-description']}>
					Manage your email signatures.{' '}
					<span className={styles.important}>
						Default signature will be automatically appended to outbound
						messages.
					</span>
				</p>

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
						<SignatureEditor
							name={signatureName}
							handleChange={handleChange}
							setEditorContent={setEditorContent}
							handleSave={handleSaveSignature}
							handleCancel={handleCancel}
						/>
					</div>
				)}
				{user.signatures?.length > 0 && (
					<ul
						className={styles['signature-list']}
						role='list'
						aria-label='Your saved signatures'
					>
						{user.signatures.map((signature, index) => {
							const parsedSignature = parseEmailContent(
								parseTinyMceContent(signature.content),
							);

							return editing === signature.id ?
									<SignatureEditor
										key={index}
										name={signatureName}
										handleChange={handleChange}
										setEditorContent={setEditorContent}
										handleSave={() => handleSaveChanges(signature.id)}
										handleCancel={handleCancel}
										initialValue={signature.content}
									/>
								:	<SignatureItem
										key={index}
										id={signature.id}
										name={signature.name}
										parsedSignature={parsedSignature}
										isDefault={signature.isDefault}
										handleEdit={() => handleEdit(signature.id)}
										handleChangeDefault={handleChangeDefault}
										handleDeleteSignature={handleDeleteSignature}
									/>;
						})}
					</ul>
				)}

				{!addingNewSignature && (
					<button
						type='button'
						className={'button settings-button'}
						onClick={handleAddSignature}
					>
						Add New Signature
					</button>
				)}
			</section>

			<section className={styles.section} aria-labelledby='templates-title'>
				<h3 id='templates-title' className={styles['section-title']}>
					Email Templates
				</h3>
				<p className={styles['section-description']}>Coming soon!</p>
			</section>

			<section
				className={styles.section}
				id='email-connection'
				aria-labelledby='integration-title'
			>
				<h3 id='integration-title' className={styles['section-title']}>
					Email Integration
				</h3>
				<p className={styles['section-description']}>
					Manage your email account connection.{' '}
					<small>
						<span className={styles.important}>
							Only Gmail is supported at this time.
						</span>
					</small>
				</p>
				<div className={styles.options}>
					<div className={styles.item}>
						<div className={styles.info}>
							<h4 id='connection-status-title'>Connection Status</h4>
							<p aria-labelledby='connection-status-title'>
								<span
									className={`${styles['status-dot']} ${user.emailConnectionActive ? styles.active : styles.inactive}`}
									role='img'
									aria-label={
										user.emailConnectionActive ? 'Connected' : 'Not connected'
									}
								/>
								{user.emailConnectionActive ?
									'Connected to Gmail'
								:	'Not connected'}
							</p>
							{user.emailConnectedAt && (
								<small>
									Last synced:{' '}
									<time
										dateTime={new Date(user.emailConnectedAt).toISOString()}
									>
										{new Date(user.emailConnectedAt).toLocaleString()}
									</time>
								</small>
							)}
						</div>
						<button
							type='button'
							className={'button settings-button'}
							onClick={
								user.emailConnectionActive ?
									handleDisconnectEmail
								:	handleConnectEmail
							}
							disabled={isConnecting}
							aria-disabled={isConnecting || isDisconnecting}
							aria-label={
								user.emailConnectionActive ?
									'Disconnect Gmail account'
								:	'Connect Gmail account'
							}
						>
							{isConnecting ?
								'Connecting...'
							: isDisconnecting ?
								'Disconnecting...'
							: user.emailConnectionActive ?
								'Disconnect'
							:	'Connect'}
						</button>
					</div>
				</div>
				<div className={styles.options}>
					<div className={styles.item}>
						<div className={styles.info}>
							<h4 id='connection-status-title'>Watching Status</h4>

							<p aria-labelledby='connection-status-title'>
								<span
									className={`${styles['status-dot']} ${watchAllowed ? styles.active : styles.inactive}`}
									role='img'
									aria-label={watchAllowed ? 'Watching' : 'Not watching'}
								/>
								{watchAllowed ? 'Watching' : 'Not watching'}
							</p>
							<small>
								Watching allows Repliably to monitor your inbox for new replies
								from your contacts.
							</small>
						</div>
						<button
							type='button'
							className={'button settings-button'}
							onClick={() =>
								watchAllowed ? handleStopWatching() : handleStartWatching()
							}
							disabled={isConnecting}
							aria-disabled={isConnecting || isDisconnecting}
							aria-label={
								watchAllowed ? 'Stop watching Gmail' : 'Start watching Gmail'
							}
						>
							{isConnecting ?
								'Connecting...'
							: isDisconnecting ?
								'Disconnecting...'
							: watchAllowed ?
								'Stop watching'
							:	'Start watching'}
						</button>
					</div>
				</div>
			</section>

			<section className={styles.section} aria-labelledby='preferences-title'>
				<h3 id='preferences-title' className={styles['section-title']}>
					Sending Preferences (Coming soon!)
				</h3>
				<SendingPreferencesForm user={user} />
			</section>
		</div>
	);
};

export default EmailSettings;
