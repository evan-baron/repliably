// Library imports
import React, { useState } from 'react';

// Hooks imports
import { useDeleteUser } from '@/hooks/useUserSettings';

// Styles imports
import styles from './deleteAccountModal.module.scss';

// Icon imports

// Components imports

// Context imports
import { useAppContext } from '@/app/context/AppContext';

const DeleteAccountModal = () => {
	const { mutateAsync: deleteUser, isPending: deletingUser } = useDeleteUser();

	const { setModalType } = useAppContext();
	const [typedDeleteText, setTypedDeleteText] = useState('');

	const confirmDeleteText = `repliably/delete-my-account`;

	const handleDelete = async () => {
		console.log('handleDelete called with typedDeleteText:', typedDeleteText);

		if (typedDeleteText !== confirmDeleteText) {
			console.warn('Typed text does not match confirm text. Aborting delete.');
			return;
		}

		try {
			console.log('Initiating account deletion...');
			await deleteUser();
			console.log('Account deletion successful, closing modal...');
		} catch (error) {
			console.error('Error deleting user account:', error);
		}
		setTypedDeleteText('');
	};

	return (
		<div className={styles['delete-account-modal']}>
			<p className={styles['confirm-delete']}>
				<span className={styles.important}>Warning:</span> Deleting your account
				will remove <span className={styles.strong}>ALL</span> related contact
				and email data. This action{' '}
				<span className={styles.strong}>cannot be undone.</span> It is{' '}
				<span className={styles.emphasized}>highly recommended</span> that you
				export any important data before proceeding.
			</p>
			<p className={styles['confirm-delete']}>
				To confirm, type "
				<span className={styles.strong}>{confirmDeleteText}</span>" in the box
				below:
			</p>
			<input
				type='text'
				id='delete'
				name='delete'
				className={styles.input}
				autoComplete='off'
				placeholder={confirmDeleteText}
				onChange={(e) => setTypedDeleteText(e.target.value)}
				value={typedDeleteText}
				spellCheck={false}
			/>
			<div className={styles.buttons}>
				<button
					type='button'
					className={'button login'}
					disabled={!typedDeleteText || typedDeleteText !== confirmDeleteText}
					onClick={handleDelete}
				>
					Delete Account
				</button>

				<button
					type='button'
					className={'button cancel'}
					onClick={() => {
						setTypedDeleteText('');
						setModalType(null);
					}}
				>
					Cancel
				</button>
			</div>
		</div>
	);
};

export default DeleteAccountModal;
