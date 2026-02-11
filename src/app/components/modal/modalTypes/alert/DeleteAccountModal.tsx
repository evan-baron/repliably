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
		if (typedDeleteText !== confirmDeleteText) {
			console.warn('Typed text does not match confirm text. Aborting delete.');
			return;
		}

		try {
			await deleteUser();
		} catch (error) {
			console.error('Error deleting user account:', error);
		}
		setTypedDeleteText('');
	};

	return (
		<div
			className={styles['delete-account-modal']}
			role='dialog'
			aria-labelledby='delete-account-title'
			aria-describedby='delete-account-description'
			aria-modal='true'
		>
			<h2 id='delete-account-title' className='sr-only'>
				Delete Account
			</h2>
			<p id='delete-account-description' className={styles['confirm-delete']}>
				<span className={styles.important}>Warning:</span> Deleting your account
				will remove <span className={styles.strong}>ALL</span> related contact
				and email data. This action{' '}
				<span className={styles.strong}>cannot be undone.</span> It is{' '}
				<span className={styles.emphasized}>highly recommended</span> that you
				export any important data before proceeding.
			</p>
			<p className={styles['confirm-delete']}>
				To confirm, type "
				<span className={`${styles.strong} ${styles['delete-text']}`}>
					{confirmDeleteText}
				</span>
				" in the box below:
			</p>
			<label htmlFor='delete' className='sr-only'>
				Type "{confirmDeleteText}" to confirm account deletion
			</label>
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
				aria-required='true'
				aria-invalid={
					typedDeleteText.length > 0 && typedDeleteText !== confirmDeleteText
				}
				aria-describedby='delete-help'
			/>
			<span id='delete-help' className='sr-only'>
				You must type the exact phrase to enable the delete button
			</span>
			<div className={styles.buttons}>
				<button
					type='button'
					className={'button delete-account'}
					disabled={!typedDeleteText || typedDeleteText !== confirmDeleteText}
					onClick={handleDelete}
					aria-disabled={
						!typedDeleteText || typedDeleteText !== confirmDeleteText
					}
				>
					Delete Account
				</button>

				<button
					type='button'
					className={'button cancel-delete'}
					onClick={() => {
						setTypedDeleteText('');
						setModalType(null);
					}}
					disabled={deletingUser}
					aria-disabled={deletingUser}
				>
					Cancel
				</button>
			</div>
		</div>
	);
};

export default DeleteAccountModal;
