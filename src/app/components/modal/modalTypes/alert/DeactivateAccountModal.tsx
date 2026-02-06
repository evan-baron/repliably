// Library imports
import React, { useState } from 'react';

// Hooks imports
import { useDeactivateUser } from '@/hooks/useUserSettings';

// Styles imports
import styles from './deactivateAccountModal.module.scss';

// Icon imports

// Components imports

// Context imports
import { useAppContext } from '@/app/context/AppContext';

const DeactivateAccountModal = () => {
	const { mutateAsync: deactivateUser, isPending: deletingUser } =
		useDeactivateUser();

	const { setModalType } = useAppContext();
	const [typedDeactivateText, setTypedDeactivateText] = useState('');

	const confirmDeactivateText = 'deactivate my account';

	const handleDeactivate = async () => {
		await deactivateUser();
		setTypedDeactivateText('');
	};

	return (
		<div className={styles['deactivate-account-modal']}>
			<p className={styles['confirm-deactivate']}>
				<span className={styles.important}>Warning:</span> Deactivating your
				account will terminate <span className={styles.strong}>ALL</span> active
				sequences and related email tracking.
			</p>
			<p className={styles['confirm-deactivate']}>
				To confirm, type "
				<span className={styles.strong}>{confirmDeactivateText}</span>" in the
				box below:
			</p>
			<input
				type='text'
				id='deactivate'
				name='deactivate'
				className={styles.input}
				autoComplete='off'
				placeholder={confirmDeactivateText}
				onChange={(e) => setTypedDeactivateText(e.target.value)}
				value={typedDeactivateText}
				spellCheck={false}
			/>
			<div className={styles.buttons}>
				<button
					type='button'
					className={'button login'}
					disabled={
						!typedDeactivateText ||
						typedDeactivateText !== confirmDeactivateText
					}
					onClick={handleDeactivate}
				>
					Deactivate Account
				</button>

				<button
					type='button'
					className={'button cancel'}
					onClick={() => {
						setTypedDeactivateText('');
						setModalType(null);
					}}
				>
					Cancel
				</button>
			</div>
		</div>
	);
};

export default DeactivateAccountModal;
