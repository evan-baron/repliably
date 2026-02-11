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

	let alertMessage = message === 'No email' ? noEmailMessage : message;

	return (
		<div className={styles['alert-modal']}>
			<span className={styles.message}>{alertMessage}</span>
			<button
				type='button'
				className='button delete'
				style={{ width: '8rem' }}
				onClick={clearAlert}
			>
				OK
			</button>
		</div>
	);
};

export default AlertModal;
