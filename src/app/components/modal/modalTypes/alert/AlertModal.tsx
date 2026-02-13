// Library imports
import Link from 'next/link';

// Hooks imports

// Styles imports
import styles from './alertModal.module.scss';

// Components imports

// Context imports

const AlertModal = ({
	message,
	clearAlert,
}: {
	message: string;
	clearAlert: () => void;
}) => {
	const noEmailMessage = (
		<span className={styles.message}>
			Your email is not currently connected. Please connect your email in your{' '}
			<Link
				href='/dashboard/settings?tab=email#email-connection'
				onClick={clearAlert}
			>
				Email Settings
			</Link>{' '}
			to create and send emails.
		</span>
	);

	const noWatchingMessage = (
		<span className={styles.message}>
			Watch notifications are currently disabled. You will not be notified
			within the platform when your contacts reply to your emails.
			<br />
			<br />
			Please re-enable watch notifications in your{' '}
			<Link
				href='/dashboard/settings?tab=email#email-connection'
				onClick={clearAlert}
			>
				Email Settings
			</Link>{' '}
			if you would like to receive notification when your contacts reply.
		</span>
	);

	let alertMessage =
		message === 'No email' ? noEmailMessage
		: message === 'No watch' ? noWatchingMessage
		: message;

	return (
		<div
			className={styles['alert-modal']}
			role='alertdialog'
			aria-labelledby='alert-message'
			aria-modal='true'
		>
			<p id='alert-message' className={styles.message}>
				{alertMessage}
			</p>
			<button
				type='button'
				className='button delete'
				style={{ width: '8rem' }}
				onClick={clearAlert}
				aria-label='Dismiss alert'
			>
				OK
			</button>
		</div>
	);
};

export default AlertModal;
